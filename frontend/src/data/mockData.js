export const CURRENT_USER = {
  id: 'STU001',
  username: 'student@campus.edu',
  displayName: 'Alex Johnson',
  role: 'STUDENT',
  department: 'Computer Science & Engineering',
  avatarUrl: null,
  status: 'ONLINE',
  customStatus: 'Building DM feature for CSE470 🚀'
};

export const MOCK_USERS = [
  {
    id: 'usr_faculty_001',
    username: 'dr_mahbub',
    displayName: 'Dr. Mahbubur Rahman',
    role: 'FACULTY',
    title: 'Professor & CSE470 Lead Faculty',
    department: 'Dept. of Computer Science & Eng.',
    avatarUrl: null,
    status: 'ONLINE',
    customStatus: 'Office Hours: 2:00 PM - 4:00 PM'
  },
  {
    id: 'usr_faculty_002',
    username: 'prof_farhana',
    displayName: 'Prof. Farhana Ahmed',
    role: 'FACULTY',
    title: 'Associate Professor',
    department: 'Dept. of Computer Science & Eng.',
    avatarUrl: null,
    status: 'OFFLINE',
    customStatus: 'In Lecture Hall 3'
  },
  {
    id: 'usr_alex_002',
    username: 'alex_dev',
    displayName: 'Alex Rivers',
    role: 'STUDENT',
    title: 'CSE470 Team Member',
    department: 'Computer Science & Engineering',
    avatarUrl: null,
    status: 'ONLINE',
    customStatus: 'Reviewing PRs'
  },
  {
    id: 'usr_sarah_003',
    username: 'sarah_m',
    displayName: 'Sarah Miller',
    role: 'STUDENT',
    title: 'CSE470 Classmate',
    department: 'Computer Science & Engineering',
    avatarUrl: null,
    status: 'OFFLINE',
    customStatus: 'Offline'
  },
  {
    id: 'usr_david_004',
    username: 'david_k',
    displayName: 'David Kim',
    role: 'STUDENT',
    title: 'CSE470 Classmate',
    department: 'Computer Science & Engineering',
    avatarUrl: null,
    status: 'OFFLINE',
    customStatus: 'Offline'
  }
];

export const MOCK_CONVERSATIONS = [
  {
    id: `dm_STU001_usr_faculty_001`,
    isGroup: false,
    recipient: MOCK_USERS[0],
    unreadCount: 1,
    lastMessage: {
      content: 'Please find attached the project proposal PDF and database schema for your review.',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      senderId: 'usr_faculty_001'
    }
  },
  {
    id: `dm_STU001_usr_alex_002`,
    isGroup: false,
    recipient: MOCK_USERS[2],
    unreadCount: 0,
    lastMessage: {
      content: 'Hey Alex! Are the DM WebSocket event endpoints ready?',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      senderId: 'usr_alex_002'
    }
  },
  {
    id: `dm_STU001_usr_sarah_003`,
    isGroup: false,
    recipient: MOCK_USERS[3],
    unreadCount: 0,
    lastMessage: {
      content: 'Thanks for sending over the schema documentation!',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      senderId: 'STU001'
    }
  }
];

export const INITIAL_MESSAGES = {
  [`dm_STU001_usr_faculty_001`]: [
    {
      id: 'msg_fac_001',
      conversationId: 'dm_STU001_usr_faculty_001',
      senderId: 'STU001',
      content: 'Respected Sir, I have submitted the Direct Messaging project proposal PDF and modular schema file for your review.',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      attachments: [
        {
          id: 'att_001',
          name: 'CSE470_DirectMessaging_Proposal.pdf',
          size: '2.4 MB',
          type: 'application/pdf',
          url: '#'
        }
      ],
      isRead: true
    },
    {
      id: 'msg_fac_002',
      conversationId: 'dm_STU001_usr_faculty_001',
      senderId: 'usr_faculty_001',
      content: 'Thank you Alex! 🎓 I have reviewed the architecture PDF.',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      isRead: false
    }
  ],
  [`dm_STU001_usr_alex_002`]: [
    {
      id: 'msg_001',
      conversationId: 'dm_STU001_usr_alex_002',
      senderId: 'usr_alex_002',
      content: 'Hi Alex! How is the CSE470 project coming along?',
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      isRead: true
    }
  ]
};
