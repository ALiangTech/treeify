/**
 * 文件树节点类型定义
 */
export interface FileTreeNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
  size?: number;
  lastModified?: number;
  visible?: boolean;
}

/**
 * 文件信息类型定义
 */
export interface FileInfo {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: number;
}

/**
 * 文件树配置选项
 */
export interface TreeifyOptions {
  /** 是否包含隐藏文件 */
  includeHidden?: boolean;
  /** 是否计算文件大小 */
  computeSize?: boolean;
  /** 排除的文件/文件夹模式 */
  exclude?: string[];
  /** 最大文件夹深度 */
  maxDepth?: number;
  /** 排除的文件夹列表 */
  excludeFolders?: string[];
}