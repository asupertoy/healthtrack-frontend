import http from './http'

export default {
    // 获取用户所在的家庭组
    getFamilyGroups(userId) {
        return http.get(`/family/groups?userId=${userId}`)
    },

    // 创建家庭组
    createGroup(data) {
        return http.post('/family/groups', data)
    },

    // 添加成员
    addMember(groupId, userId) {
        return http.post(`/family/groups/${groupId}/members`, { userId })
    },

    // 移除成员
    removeMember(memberId) {
        return http.delete(`/family/members/${memberId}`)
    },

    // 获取家庭组详细信息（成员列表）
    getGroupDetail(groupId) {
        return http.get(`/family/groups/${groupId}`)
    },
}
