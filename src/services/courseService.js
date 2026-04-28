// src/services/courseService.js
import { DB_URL } from '../config/api';
import StorageService from './storageService';

async function authHeader() {
  const token = await StorageService.get('token');
  return { Authorization: `Bearer ${token}` };
}

async function dbGet(params) {
  const headers = await authHeader();
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${DB_URL}/read?${query}`, { headers });
  if (response.status !== 200) throw new Error('Error al consultar datos');
  return response.json();
}

async function dbInsert(tableName, records) {
  const headers = { ...(await authHeader()), 'Content-Type': 'application/json' };
  const response = await fetch(`${DB_URL}/insert`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ tableName, records }),
  });
  if (response.status !== 201) throw new Error('Error al insertar datos');
  return response.json();
}

const CourseService = {
  async getCoursesByUser() {
    const userId = await StorageService.get('userId');
    const rol = await StorageService.get('rol');

    if (rol === 'profesor') {
      return dbGet({ tableName: 'course', profesor_id: userId });
    }

    // Estudiante: obtener membresías y luego cursos
    const memberships = await dbGet({ tableName: 'course_members', estudiante_id: userId });
    if (!memberships.length) return [];

    const courses = [];
    for (const m of memberships) {
      try {
        const result = await dbGet({ tableName: 'course', _id: m.course_id });
        if (result.length) courses.push(result[0]);
      } catch {}
    }
    return courses;
  },

  async getActivitiesCountByCourse(courseId) {
    try {
      const activities = await dbGet({ tableName: 'activity', course_id: courseId });
      const now = new Date();
      return activities.filter(a => {
        const start = new Date(a.start_date);
        const end = new Date(a.end_date);
        return now > start && now < end;
      }).length;
    } catch {
      return 0;
    }
  },

  async getActivitiesByCourse(courseId) {
    return dbGet({ tableName: 'activity', course_id: courseId });
  },

  async getCategoriesByCourse(courseId) {
    const categories = await dbGet({ tableName: 'category', course_id: courseId });
    return categories;
  },

  async createCourse(name, nrc, profesorId) {
    return dbInsert('course', [{ name, nrc, profesor_id: profesorId }]);
  },

  async getGroupsByCategory(categoryId) {
    return dbGet({ tableName: 'groups', category_id: categoryId });
  },

  async getMyGroupInActivity(activityId, userId) {
    // Obtener category_id de la actividad
    const actData = await dbGet({ tableName: 'activity', _id: activityId });
    if (!actData.length) return null;
    const categoryId = actData[0].category_id;

    // Obtener membresías del estudiante
    const memberships = await dbGet({ tableName: 'group_members', estudiante_id: userId });
    for (const m of memberships) {
      const groupData = await dbGet({ tableName: 'groups', _id: m.group_id });
      if (!groupData.length) continue;
      if (groupData[0].category_id !== categoryId) continue;

      // Obtener miembros del grupo
      const members = await dbGet({ tableName: 'group_members', group_id: m.group_id });
      const membersWithInfo = [];
      for (const member of members) {
        if (member.estudiante_id === userId) continue;
        try {
          const userData = await dbGet({ tableName: 'Users', userId: member.estudiante_id });
          if (userData.length) membersWithInfo.push(userData[0]);
        } catch {}
      }
      return { ...groupData[0], members: membersWithInfo };
    }
    return null;
  },

  async getAllMyGroupsInCourse(courseId, userId) {
    const memberships = await dbGet({ tableName: 'group_members', estudiante_id: userId });
    const result = [];
    for (const m of memberships) {
      try {
        const groupData = await dbGet({ tableName: 'groups', _id: m.group_id });
        if (!groupData.length) continue;
        const categoryData = await dbGet({ tableName: 'category', _id: groupData[0].category_id });
        if (!categoryData.length) continue;
        if (categoryData[0].course_id !== courseId) continue;
        const members = await dbGet({ tableName: 'group_members', group_id: m.group_id });
        result.push({
          categoryName: categoryData[0].name,
          groupName: groupData[0].name,
          membersCount: members.length,
        });
      } catch {}
    }
    return result;
  },
};

export default CourseService;