'use client';

import { useState, useEffect } from 'react';
import { FileTreeNode } from '@/utils/types';
import { formatFileSize } from '@/utils/file';

interface TreeNodeProps {
  node: FileTreeNode;
  level?: number;
  style?: {
    showLines?: boolean;
    indentSize?: number;
    lineColor?: string;
    iconColor?: string;
  };
  onVisibilityChange?: (node: FileTreeNode, visible: boolean) => void;
}

export default function TreeNode({ node, level = 0, style = {}, onVisibilityChange }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const [visible, setVisible] = useState(node.visible !== false); // 默认为可见
  
  const {
    showLines = true,
    indentSize = 16,
    lineColor = 'rgb(229 231 235)',
    iconColor = 'currentColor'
  } = style;

  // 初始化时设置节点可见性
  useEffect(() => {
    if (node.visible === undefined) {
      node.visible = true;
    }
  }, [node]);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const toggleVisibility = (e: React.MouseEvent) => {
    // 如果是根节点（level=0），则不允许切换可见性
    if (level === 0) return;
    
    e.stopPropagation();
    const newVisibility = !visible;
    setVisible(newVisibility);
    node.visible = newVisibility;
    if (onVisibilityChange) {
      onVisibilityChange(node, newVisibility);
    }
  };

  const indent = level * indentSize;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div 
        className="flex items-center py-1 hover:bg-gray-100 dark:hover:bg-gray-800/30 rounded px-1 cursor-pointer"
        style={{ paddingLeft: `${indent}px` }}
      >
        {/* 文件/文件夹图标 */}
        {node.type === 'directory' ? (
          <svg 
            className="w-5 h-5 mr-1 flex-shrink-0" 
            fill="none" 
            stroke={iconColor} 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {expanded ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            )}
          </svg>
        ) : (
          <svg 
            className="w-5 h-5 mr-1 flex-shrink-0" 
            fill="none" 
            stroke={iconColor} 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        
        {/* 节点名称和展开按钮 */}
        <div 
          className="flex-grow flex items-center cursor-pointer" 
          onClick={hasChildren ? toggleExpand : undefined}
        >
          <span className="truncate">{node.name}</span>
          
          {/* 文件大小 */}
          {node.type === 'file' && node.size !== undefined && (
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(node.size)}
            </span>
          )}
        </div>
        
        {/* 眼睛按钮 - 控制可见性 */}
        <button 
          className={`ml-2 p-1 rounded-full ${level === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-700'} focus:outline-none`}
          onClick={toggleVisibility}
          title={level === 0 ? "根目录不能隐藏" : (visible ? "在目录结构中隐藏" : "在目录结构中显示")}
        >
          <svg 
            className="w-4 h-4 text-gray-500 dark:text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {visible ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            )}
          </svg>
        </button>
      </div>
      
      {/* 子节点 */}
      {expanded && hasChildren && (
        <div className="relative">
          {showLines && level > 0 && (
            <div 
              className="absolute top-0 bottom-0 w-px" 
              style={{ 
                left: `${indent - indentSize/2}px`,
                backgroundColor: lineColor 
              }}
            />
          )}
          {node.children?.map((child, index) => (
            <TreeNode 
              key={`${child.name}-${index}`}
              node={child} 
              level={level + 1}
              style={style}
              onVisibilityChange={onVisibilityChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}