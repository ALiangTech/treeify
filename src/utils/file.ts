import { FileTreeNode, FileInfo, TreeifyOptions } from './types';

/**
 * 将FileList转换为FileTreeNode结构
 * @param fileList 文件列表
 * @param options 树生成选项
 * @returns 文件树结构
 */
export function createFileTree(fileList: FileList, options?: TreeifyOptions): FileTreeNode[] {
  const trees: FileTreeNode[] = [];
  
  // 设置默认选项
  const defaultOptions: TreeifyOptions = {
    maxDepth: 10,
    excludeFolders: ['node_modules', '.git', '.next', 'dist', 'build'],
    includeHidden: false,
    computeSize: true
  };
  
  // 合并选项
  const mergedOptions: TreeifyOptions = { ...defaultOptions, ...options };

  // 检查是否有webkitRelativePath属性
  const hasRelativePath = Array.from(fileList).some(file => file.webkitRelativePath && file.webkitRelativePath.length > 0);
  
  if (!hasRelativePath) {
    // 如果没有相对路径，创建一个简单的文件列表
    console.log('没有相对路径，创建简单文件列表');
    
    // 创建一个根文件夹
    const rootFolder: FileTreeNode = {
      name: '拖拽文件',
      type: 'directory',
      children: []
    };
    
    // 将所有文件添加到根文件夹
    Array.from(fileList).forEach(file => {
      rootFolder.children?.push({
        name: file.name,
        type: 'file',
        size: file.size,
        lastModified: file.lastModified
      });
    });
    
    trees.push(rootFolder);
    return trees;
  }

  // 正常处理有相对路径的情况
  Array.from(fileList).forEach((file) => {
    const pathParts = file.webkitRelativePath.split('/');
    
    // 跳过空路径
    if (pathParts.length === 0) return;
    
    // 查找或创建第一层节点（根目录）
    let firstLevelNode = trees.find(node => node.name === pathParts[0]);
    if (!firstLevelNode) {
      firstLevelNode = {
        name: pathParts[0],
        type: 'directory',
        children: [],
      };
      trees.push(firstLevelNode);
    }
    let currentNode = firstLevelNode;

    // 构建目录结构（从第二层开始，避免重复处理根目录）
    let currentDepth = 1; // 根目录已经是第1层
    
    for (let i = 1; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      
      // 检查是否超过最大深度
      if (mergedOptions.maxDepth && currentDepth >= mergedOptions.maxDepth) {
        break;
      }
      
      // 检查是否是排除的文件夹
      if (mergedOptions.excludeFolders && mergedOptions.excludeFolders.includes(part)) {
        return; // 跳过这个文件
      }
      
      let child = currentNode.children?.find((node) => node.name === part);
      if (!child) {
        child = {
          name: part,
          type: 'directory',
          children: [],
        };
        currentNode.children?.push(child);
      }
      currentNode = child;
      currentDepth++;
    }

    // 检查是否超过最大深度
    if (!mergedOptions.maxDepth || currentDepth < mergedOptions.maxDepth) {
      // 添加文件节点
      const fileName = pathParts[pathParts.length - 1];
      currentNode.children?.push({
        name: fileName,
        type: 'file',
        size: file.size,
        lastModified: file.lastModified,
      });
    }
  });

  return trees;
}

/**
 * 获取文件信息
 * @param file 文件对象
 * @returns 文件信息
 */
export function getFileInfo(file: File): FileInfo {
  return {
    name: file.name,
    path: file.webkitRelativePath,
    size: file.size,
    type: file.type || 'application/octet-stream',
    lastModified: file.lastModified,
  };
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}