// lib/api/group/groupsapi.ts
import { ApiResponse, Group } from '@/lib/api/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export const fetchGroupsApi = async (token: string): Promise<Group[]> => {
    if (!API_BASE_URL) {
        throw new Error('Backend API URL is not defined.');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/Groups/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            let errorMessage = `Failed to fetch groups with status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.Error || errorData.message || errorMessage;
            } catch (jsonParseError) {
                // No console.error for jsonParseError as per instructions
            }
            throw new Error(errorMessage);
        }

        const responseJson: { groups: any[] } = await response.json();

        const mappedGroups: Group[] = (responseJson.groups || []).map(rawGroup => ({
            groupId: rawGroup.groupId,
            groupName: rawGroup.groupName,
            memberCount: rawGroup.memberCount,
            profilePictureUrl: rawGroup.groupProfilePictureUrl
        }));

        return mappedGroups;

    } catch (error) {
        throw error;
    }
};

export const createGroupApi = async (
    token: string,
    groupName: string,
    memberIds: number[]
): Promise<Group> => {
    if (!API_BASE_URL) {
        throw new Error('Backend API URL is not defined.');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/Groups/CreateGroup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ groupName, memberIds }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create group.');
        }

        const rawData: ApiResponse<any> = await response.json();

        if (!rawData.data) {
            throw new Error('Failed to create group: No data returned.');
        }

        const createdGroup: Group = {
            groupId: rawData.data.groupId,
            groupName: rawData.data.groupName,
            memberCount: rawData.data.memberCount,
            profilePictureUrl: rawData.data.groupProfilePictureUrl
        };
        return createdGroup;

    } catch (error) {
        throw error;
    }
};

export const updateGroupNameApi = async (
    token: string,
    groupId: number,
    newName: string
): Promise<void> => {
    if (!API_BASE_URL) {
        throw new Error('Backend API URL is not defined.');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/Groups/${groupId}/Changename`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(newName),
        });

        if (!response.ok) {
            let errorMessage = `Failed to update group name with status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.Error || errorData.message || errorMessage;
            } catch (jsonParseError) {
                // No console.error for jsonParseError as per instructions
            }
            throw new Error(errorMessage);
        }
    } catch (error) {
        throw error;
    }
};

export const uploadGroupProfilePictureApi = async (
    token: string,
    groupId: number,
    file: File
): Promise<string> => {
    if (!API_BASE_URL) {
        throw new Error('Backend API URL is not defined.');
    }

    const formData = new FormData();
    formData.append('ProfilePictureFile', file);

    try {
        const response = await fetch(`${API_BASE_URL}/api/Groups/${groupId}/ChangeProfilePicture`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            let errorMessage = `Failed to upload group profile picture with status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.Error || errorData.message || errorMessage;
            } catch (jsonParseError) {
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        if (typeof data === 'string') {
            return data;
        } else if (data && data.profilePictureUrl) {
            return data.profilePictureUrl;
        } else {
            throw new Error('Failed to upload group profile picture: Invalid response or missing URL from server.');
        }
    } catch (error) {
        throw error;
    }
};