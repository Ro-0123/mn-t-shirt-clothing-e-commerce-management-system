import sequelize from './backend/config/database.js';
import User from './backend/models/User.js';

const verify = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'role', 'createdAt'],
      order: [['id', 'DESC']]
    });

    console.log('📋 All registered users:');
    console.log('='.repeat(100));
    users.forEach(user => {
      console.log(`ID: ${user.id} | Name: ${user.firstName} ${user.lastName} | Email: ${user.email} | Phone: ${user.phone} | Role: ${user.role} | Created: ${user.createdAt}`);
    });
    console.log('='.repeat(100));
    console.log(`\n✅ Total users: ${users.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

verify();
