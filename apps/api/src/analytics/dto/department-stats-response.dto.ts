export class DepartmentStat {
  department: string;
  totalUsers: number;
  activeUsers: number;
  hackathonParticipations: number;
  challengeSubmissions: number;
  averageScore: number;
  engagementRate: number;
}

export class DepartmentStatsResponseDto {
  departments: DepartmentStat[];
  totalDepartments: number;
  mostActiveDepartment: string;
  leastActiveDepartment: string;
}
