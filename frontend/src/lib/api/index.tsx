export * from './comments';
export * from './Posts';
export * from './types';
export * from './utils';

import { UserAPI } from './user';
import { HumorAPI } from './humor';
import { FriendsAPI } from './friend';

export type { 
  FullUser, 
  UserResponse, 
  FriendPostCount 
} from './user';

export type { 
  HumorTypesResponse, 
  UserHumorResponse 
} from './humor';

export type { 
  FriendRequestDTO, 
  Friend 
} from './friend';

export class APIClient {
  public user: UserAPI;
  public humor: HumorAPI;
  public friends: FriendsAPI;

  constructor(token: string) {
    this.user = new UserAPI(token);
    this.humor = new HumorAPI(token);
    this.friends = new FriendsAPI(token);
  }
}