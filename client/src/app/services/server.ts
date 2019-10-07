const DEVELOPMENT_MODE = true;

let serverAddress: string;

if (DEVELOPMENT_MODE) {
  serverAddress = 'http://localhost:8080';
} else {
  serverAddress = 'https://example.com';
}

export const server = {
  login: serverAddress + '/login',
  passwordRequest: serverAddress + '/login/passwordRequest',
  passwordReset: serverAddress + '/login/passwordReset',
  sessionClose: serverAddress + '/login/sessionClose',

  user: serverAddress + '/api/user/users',
  addUser: serverAddress + '/api/user/add',
  viewUser: serverAddress + '/api/user/view',
  deleteUser: serverAddress + '/api/user/delete',

  degree: serverAddress + '/api/degree/degrees',
  addDegree: serverAddress + '/api/degree/add',
  viewDegree: serverAddress + '/api/degree/view',
  deleteDegree: serverAddress + '/api/degree/delete',

  studyBranch: serverAddress + '/api/studyBranch/studyBranches',
  addStudyBranch: serverAddress + '/api/studyBranch/add',
  viewStudyBranch: serverAddress + '/api/studyBranch/view',
  deleteStudyBranch: serverAddress + '/api/studyBranch/delete',

  student: serverAddress + '/api/student/students',
  addStudent: serverAddress + '/api/student/add',
  viewStudent: serverAddress + '/api/student/view',
  deleteStudent: serverAddress + '/api/student/delete'
};
