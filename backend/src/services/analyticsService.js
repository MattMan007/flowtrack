const Event = require('../models/Event');
const Task = require('../models/Task');

class AnalyticsService {
  async getAverageTimePerStage(workflowId, organizationId) {
    const stageChanges = await Event.find({
      workflowId,
      organizationId,
      eventType: 'stage_changed'
    }).sort({ taskId: 1, timestamp: 1 });

    const stageDurations = {};
    const stageCounts = {};
    const taskStageEntry = {};

    for (const event of stageChanges) {
      const taskId = event.taskId.toString();
      const toStage = event.toStage;

      taskStageEntry[`${taskId}_${toStage}`] = event.timestamp;

      if (event.fromStage) {
        const entryKey = `${taskId}_${event.fromStage}`;
        if (taskStageEntry[entryKey]) {
          const duration = event.timestamp - taskStageEntry[entryKey];
          const durationInHours = duration / (1000 * 60 * 60);

          if (!stageDurations[event.fromStage]) {
            stageDurations[event.fromStage] = 0;
            stageCounts[event.fromStage] = 0;
          }

          stageDurations[event.fromStage] += durationInHours;
          stageCounts[event.fromStage] += 1;
        }
      }
    }

    const completedTasks = await Event.find({
      workflowId,
      organizationId,
      eventType: 'task_completed'
    });

    for (const event of completedTasks) {
      const taskId = event.taskId.toString();
      const lastStage = event.toStage;

      if (lastStage) {
        const entryKey = `${taskId}_${lastStage}`;
        if (taskStageEntry[entryKey]) {
          const duration = event.timestamp - taskStageEntry[entryKey];
          const durationInHours = duration / (1000 * 60 * 60);

          if (!stageDurations[lastStage]) {
            stageDurations[lastStage] = 0;
            stageCounts[lastStage] = 0;
          }

          stageDurations[lastStage] += durationInHours;
          stageCounts[lastStage] += 1;
        }
      }
    }

    const averages = {};
    for (const stage in stageDurations) {
      averages[stage] = {
        averageHours: stageDurations[stage] / stageCounts[stage],
        taskCount: stageCounts[stage]
      };
    }

    return averages;
  }

  async getTasksCompletedOverTime(organizationId, startDate, endDate, groupBy = 'day') {
    const matchStage = {
      organizationId,
      eventType: 'task_completed'
    };

    if (startDate || endDate) {
      matchStage.timestamp = {};
      if (startDate) matchStage.timestamp.$gte = new Date(startDate);
      if (endDate) matchStage.timestamp.$lte = new Date(endDate);
    }

    const dateFormat = groupBy === 'week' ? '%Y-W%V' : '%Y-%m-%d';

    const result = await Event.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return result.map(item => ({
      date: item._id,
      count: item.count
    }));
  }

  async detectBottlenecks(workflowId, organizationId) {
    const averages = await this.getAverageTimePerStage(workflowId, organizationId);

    const stages = Object.keys(averages).map(stage => ({
      stage,
      averageHours: averages[stage].averageHours,
      taskCount: averages[stage].taskCount
    }));

    stages.sort((a, b) => b.averageHours - a.averageHours);

    return stages;
  }

  async getDashboardStats(organizationId) {
    const [totalTasks, activeTasks, completedTasks] = await Promise.all([
      Task.countDocuments({ organizationId }),
      Task.countDocuments({ organizationId, status: 'active' }),
      Task.countDocuments({ organizationId, status: 'completed' })
    ]);

    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [tasksLast7Days, tasksLast30Days] = await Promise.all([
      Event.countDocuments({
        organizationId,
        eventType: 'task_created',
        timestamp: { $gte: last7Days }
      }),
      Event.countDocuments({
        organizationId,
        eventType: 'task_created',
        timestamp: { $gte: last30Days }
      })
    ]);

    return {
      totalTasks,
      activeTasks,
      completedTasks,
      tasksLast7Days,
      tasksLast30Days
    };
  }
}

module.exports = new AnalyticsService();

