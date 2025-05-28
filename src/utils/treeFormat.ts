/**
 * 将文件树转换为文本格式的目录结构
 * 例如：
 * src
 * ├─ app
 * │    ├─ favicon.ico
 * │    ├─ globals.css
 * │    └─ layout.tsx
 * └─ components
 *      └─ Button.tsx
 */
import { FileTreeNode } from './types';

/**
 * 生成文本格式的目录结构
 * @param nodes 文件树节点
 * @param prefix 前缀（用于递归）
 * @returns 格式化的目录结构文本
 */
export function generateTreeText(nodes: FileTreeNode[], prefix = ''): string {
  if (!nodes || nodes.length === 0) return '';
  
  let result = '';
  
  // 过滤出可见的节点
  const visibleNodes = nodes.filter(node => node.visible !== false);
  
  visibleNodes.forEach((node, index) => {
    const isLast = index === visibleNodes.length - 1;
    const linePrefix = isLast ? '└─ ' : '├─';
    const childPrefix = isLast ? '    ' : '│    ';
    
    // 添加当前节点
    result += `${prefix}${linePrefix}${node.name}\n`;
    
    // 递归处理子节点
    if (node.type === 'directory' && node.children && node.children.length > 0) {
      // 只处理可见的子节点
      result += generateTreeText(node.children, prefix + childPrefix);
    }
  });
  
  return result;
}

/**
 * 格式化完整的目录结构文本
 * @param nodes 文件树节点
 * @returns 完整的目录结构文本
 */
export function formatDirectoryTree(nodes: FileTreeNode[]): string {
  if (!nodes || nodes.length === 0) return '';
  
  // 获取根目录名称
  const rootName = nodes[0].name;
  let result = `${rootName}\n`;
  
  // 处理根目录下的子节点
  if (nodes[0].children && nodes[0].children.length > 0) {
    // 确保根节点的visible属性不影响其显示
    const rootVisible = nodes[0].visible;
    nodes[0].visible = true; // 强制根节点可见
    
    // 只处理可见的子节点
    result += generateTreeText(nodes[0].children, '');
    
    // 恢复原始可见性状态（虽然在UI上已禁用修改，但保持数据一致性）
    nodes[0].visible = rootVisible;
  }
  
  return result;
}