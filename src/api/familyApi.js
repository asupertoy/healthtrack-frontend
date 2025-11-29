import http from './http'

export default {
    // 创建家庭组
    createFamilyGroup(data) {
        return http.post('/family-groups', data).then(res => res.data)
    },

    // 获取单个家庭组
    getFamilyGroup(groupId) {
        return http.get(`/family-groups/${groupId}`).then(res => res.data)
    },

    // 获取所有家庭组
    getFamilyGroups() {
        return http.get('/family-groups').then(res => res.data)
    },

    // 更新家庭组
    updateFamilyGroup(data) {
        return http.put('/family-groups', data).then(res => res.data)
    },

    // 删除家庭组
    deleteFamilyGroup(groupId) {
        return http.delete(`/family-groups/${groupId}`).then(res => res.data)
    },

    // 获取组成员
    getMembers(groupId) {
        return http.get(`/family-groups/${groupId}/members`).then(res => res.data)
    },

    // 添加成员
    addMember(groupId, userId, role) {
        return http.post(`/family-groups/${groupId}/members/${userId}`, null, {
            params: { role },
        }).then(res => res.data)
    },

    // 移除成员
    removeMember(memberId) {
        return http.delete(`/family-groups/members/${memberId}`).then(res => res.data)
    },
}
