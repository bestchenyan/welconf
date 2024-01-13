export interface _memberType {
  name: string;
  text: string;
  value: string;
}

export interface Permission {
  id: string;
  memberId: string;
  memberType: string;
  permit: string;
  schemaId: string;
  remark?: any;
  _memberType: _memberType;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  icon?: any;
  createTime: string;
  modifyTime: string;
  remark?: any;
  disabled: boolean;
  creator: string;
  modifier?: any;
  phonetic: string;
  categoryId?: any;
  sort: number;
  tenantId?: any;
  sourceId?: any;
  departmentId: string;
  categoryName?: any;
}

export interface _terminalType {
  name: string;
  text: string;
  value: string;
}

export interface _statu {
  name: string;
  text: string;
  value: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  sex: string;
  email?: any;
  phone?: any;
  disabled: boolean;
  creator: string;
  modifier: string;
  createTime: string;
  remark?: any;
  phonetic: string;
  regionId: string;
  photo?: any;
  modifyTime: string;
  userType: string;
  terminalType: string;
  departmentId?: any;
  personId?: any;
  accountExpireTime?: any;
  passwordExpireTime: string;
  tenantId: string;
  sign?: any;
  sourceId?: any;
  passwordChanged: boolean;
  status: string;
  identityNumber?: any;
  telephone?: any;
  gridName?: any;
  identity?: any;
  description?: any;
  linkDepartmentName?: any;
  departmentName?: any;
  personName?: any;
  sexName: string;
  regionName?: any;
  userTypeName: string;
  position?: any;
  _terminalType: _terminalType;
  _status: _statu;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  permissions: Permission[];
  roles: Role[];
  region?: any;
  department?: any;
  user: User;
  loginTime: string;
}
