export default interface TreeNode {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id?: any;
  name?: string;
  selected?: boolean;
  children?: TreeNode[];
}
