// Keyed by schoolId so mock teacher service can filter correctly.
export const teachersData = {
  1: [
    { id: 101, name: 'Priya Sharma', email: 'priya.sharma@dps.edu.in', status: 'ACTIVE', schoolId: 1, createdAt: '2024-03-01T10:00:00' },
    { id: 102, name: 'Rahul Verma', email: 'rahul.verma@dps.edu.in', status: 'ACTIVE', schoolId: 1, createdAt: '2024-03-05T10:00:00' },
    { id: 103, name: 'Anita Joshi', email: 'anita.joshi@dps.edu.in', status: 'INACTIVE', schoolId: 1, createdAt: '2024-03-10T10:00:00' },
  ],
  2: [
    { id: 201, name: 'Suresh Kumar', email: 'suresh.kumar@kvsec8.edu.in', status: 'ACTIVE', schoolId: 2, createdAt: '2024-03-01T10:00:00' },
    { id: 202, name: 'Meena Pillai', email: 'meena.pillai@kvsec8.edu.in', status: 'ACTIVE', schoolId: 2, createdAt: '2024-03-08T10:00:00' },
  ],
  3: [
    { id: 301, name: 'Debashree Sen', email: 'debashree.sen@heritageschool.in', status: 'ACTIVE', schoolId: 3, createdAt: '2024-03-01T10:00:00' },
  ],
  4: [],
}
