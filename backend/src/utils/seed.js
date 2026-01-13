require('dotenv').config();
const mongoose = require('mongoose');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Workflow = require('../models/Workflow');
const Task = require('../models/Task');
const Event = require('../models/Event');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Event.deleteMany({});
    await Task.deleteMany({});
    await Workflow.deleteMany({});
    await User.deleteMany({});
    await Organization.deleteMany({});
    console.log('Cleared existing data');

    const org = await Organization.create({
      name: 'Demo Organization',
      slug: 'demo-org'
    });
    console.log('Created organization:', org.name);

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'password123',
      organizationId: org._id,
      role: 'admin'
    });
    console.log('Created admin user:', adminUser.email);

    const memberUser = await User.create({
      name: 'Team Member',
      email: 'member@demo.com',
      password: 'password123',
      organizationId: org._id,
      role: 'member'
    });
    console.log('Created member user:', memberUser.email);

    const workflow1 = await Workflow.create({
      name: 'Software Development',
      description: 'Standard software development workflow',
      organizationId: org._id,
      createdBy: adminUser._id,
      stages: [
        { name: 'Backlog', order: 0 },
        { name: 'In Progress', order: 1 },
        { name: 'Code Review', order: 2 },
        { name: 'Testing', order: 3 },
        { name: 'Done', order: 4 }
      ]
    });
    console.log('Created workflow:', workflow1.name);

    const workflow2 = await Workflow.create({
      name: 'Content Creation',
      description: 'Content pipeline workflow',
      organizationId: org._id,
      createdBy: adminUser._id,
      stages: [
        { name: 'Ideas', order: 0 },
        { name: 'Writing', order: 1 },
        { name: 'Editing', order: 2 },
        { name: 'Published', order: 3 }
      ]
    });
    console.log('Created workflow:', workflow2.name);

    const now = Date.now();
    const hoursAgo = (hours) => new Date(now - hours * 60 * 60 * 1000);

    const task1 = await Task.create({
      title: 'Build authentication system',
      description: 'Implement JWT-based authentication',
      organizationId: org._id,
      workflowId: workflow1._id,
      currentStage: 'Testing',
      createdBy: adminUser._id,
      createdAt: hoursAgo(72)
    });

    await Event.create({
      eventType: 'task_created',
      organizationId: org._id,
      userId: adminUser._id,
      taskId: task1._id,
      workflowId: workflow1._id,
      toStage: 'Backlog',
      timestamp: hoursAgo(72)
    });

    await Event.create({
      eventType: 'stage_changed',
      organizationId: org._id,
      userId: adminUser._id,
      taskId: task1._id,
      workflowId: workflow1._id,
      fromStage: 'Backlog',
      toStage: 'In Progress',
      timestamp: hoursAgo(48)
    });

    await Event.create({
      eventType: 'stage_changed',
      organizationId: org._id,
      userId: memberUser._id,
      taskId: task1._id,
      workflowId: workflow1._id,
      fromStage: 'In Progress',
      toStage: 'Code Review',
      timestamp: hoursAgo(24)
    });

    await Event.create({
      eventType: 'stage_changed',
      organizationId: org._id,
      userId: adminUser._id,
      taskId: task1._id,
      workflowId: workflow1._id,
      fromStage: 'Code Review',
      toStage: 'Testing',
      timestamp: hoursAgo(6)
    });

    const task2 = await Task.create({
      title: 'Create dashboard UI',
      description: 'Design and implement the main dashboard',
      organizationId: org._id,
      workflowId: workflow1._id,
      currentStage: 'In Progress',
      createdBy: memberUser._id,
      createdAt: hoursAgo(48)
    });

    await Event.create({
      eventType: 'task_created',
      organizationId: org._id,
      userId: memberUser._id,
      taskId: task2._id,
      workflowId: workflow1._id,
      toStage: 'Backlog',
      timestamp: hoursAgo(48)
    });

    await Event.create({
      eventType: 'stage_changed',
      organizationId: org._id,
      userId: memberUser._id,
      taskId: task2._id,
      workflowId: workflow1._id,
      fromStage: 'Backlog',
      toStage: 'In Progress',
      timestamp: hoursAgo(24)
    });

    const task3 = await Task.create({
      title: 'Setup MongoDB indexes',
      description: 'Optimize database queries',
      organizationId: org._id,
      workflowId: workflow1._id,
      currentStage: 'Done',
      status: 'completed',
      completedAt: hoursAgo(12),
      createdBy: adminUser._id,
      createdAt: hoursAgo(96)
    });

    await Event.create({
      eventType: 'task_created',
      organizationId: org._id,
      userId: adminUser._id,
      taskId: task3._id,
      workflowId: workflow1._id,
      toStage: 'Backlog',
      timestamp: hoursAgo(96)
    });

    await Event.create({
      eventType: 'stage_changed',
      organizationId: org._id,
      userId: adminUser._id,
      taskId: task3._id,
      workflowId: workflow1._id,
      fromStage: 'Backlog',
      toStage: 'In Progress',
      timestamp: hoursAgo(72)
    });

    await Event.create({
      eventType: 'stage_changed',
      organizationId: org._id,
      userId: adminUser._id,
      taskId: task3._id,
      workflowId: workflow1._id,
      fromStage: 'In Progress',
      toStage: 'Done',
      timestamp: hoursAgo(48)
    });

    await Event.create({
      eventType: 'task_completed',
      organizationId: org._id,
      userId: adminUser._id,
      taskId: task3._id,
      workflowId: workflow1._id,
      toStage: 'Done',
      timestamp: hoursAgo(12)
    });

    const task4 = await Task.create({
      title: 'Write API documentation',
      description: 'Document all API endpoints',
      organizationId: org._id,
      workflowId: workflow1._id,
      currentStage: 'Backlog',
      createdBy: adminUser._id,
      createdAt: hoursAgo(12)
    });

    await Event.create({
      eventType: 'task_created',
      organizationId: org._id,
      userId: adminUser._id,
      taskId: task4._id,
      workflowId: workflow1._id,
      toStage: 'Backlog',
      timestamp: hoursAgo(12)
    });

    const task5 = await Task.create({
      title: 'Product launch blog post',
      description: 'Write announcement post',
      organizationId: org._id,
      workflowId: workflow2._id,
      currentStage: 'Writing',
      createdBy: memberUser._id,
      createdAt: hoursAgo(36)
    });

    await Event.create({
      eventType: 'task_created',
      organizationId: org._id,
      userId: memberUser._id,
      taskId: task5._id,
      workflowId: workflow2._id,
      toStage: 'Ideas',
      timestamp: hoursAgo(36)
    });

    await Event.create({
      eventType: 'stage_changed',
      organizationId: org._id,
      userId: memberUser._id,
      taskId: task5._id,
      workflowId: workflow2._id,
      fromStage: 'Ideas',
      toStage: 'Writing',
      timestamp: hoursAgo(24)
    });

    console.log('\n✅ Seed data created successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@demo.com / password123');
    console.log('Member: member@demo.com / password123');
    console.log(`\nCreated ${await Task.countDocuments()} tasks`);
    console.log(`Created ${await Event.countDocuments()} events`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

