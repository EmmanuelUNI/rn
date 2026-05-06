export type GroupMember = {
  userId: string;
  name: string;
  email?: string;
};

export type Group = {
  _id: string;
  name: string;
  category_id: string;
  members: GroupMember[];
};

export type MyGroupSummary = {
  categoryName: string;
  groupName: string;
  membersCount: number;
};