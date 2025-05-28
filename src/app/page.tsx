'use client';

import { useState, useCallback, useRef } from 'react';
import { createFileTree } from '@/utils/file';
import { FileTreeNode } from '@/utils/types';
import TreeNode from '@/components/TreeNode';
import { formatDirectoryTree } from '@/utils/treeFormat';
export default function TreeifyPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [fileTree, setFileTree] = useState<FileTreeNode[] | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [treeStyle] = useState({
    showLines: true,
    indentSize: 16,
    lineColor: 'rgb(229 231 235)',
    iconColor: 'currentColor'
  });
// 递归读取目录内的所有文件
function readEntry(
  entry: any,
  webkitRelativePath: string = '',
  fileList: any[] = []
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (entry.isFile) {
      entry.file((file: File) => {
        fileList.push({
          name: file.name,
          type: 'file',
          size: file.size,
          lastModified: file.lastModified,
          webkitRelativePath: webkitRelativePath + file.name,
        });
        resolve();
      }, reject);
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      reader.readEntries(async (entries: any[]) => {
        // 过滤 node_modules 文件夹
        if (entry.name === 'node_modules') {
          return resolve();
        }
        for (let i = 0; i < entries.length; i++) {
          await readEntry(entries[i], webkitRelativePath + entry.name + '/', fileList);
        }
        resolve();
      }, reject);
    }
  });
}

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    const files: any[] | FileList | undefined = [];
    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry?.();
      if (entry) {
        await readEntry(entry, '', files);
      }
    }
    console.log('文件列表:', files);
    const tree = createFileTree(files as any);
    console.log('生成的文件树:', tree);                 
    // 更新文件树状态
    setFileTree(tree);
  }, [treeStyle]);

  const handleCopyText = useCallback(() => {
    if (textAreaRef.current && fileTree) {
      textAreaRef.current.select();
      // 使用现代的 Clipboard API 替代已弃用的 execCommand
      navigator.clipboard.writeText(textAreaRef.current.value);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [fileTree]);

  // 处理节点可见性变更
  const handleNodeVisibilityChange = useCallback(() => {
    // 强制更新目录文本
    setFileTree(prevTree => {
      if (!prevTree) return null;
      const newTree = [...prevTree];  
      return newTree;
    });
  }, []);
  
  // 根据上传的文件夹生成目录结构文本
  const treeText = fileTree? formatDirectoryTree(fileTree) : '';
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Treeify</h1>
        <div className="flex space-x-2">
          {/* 请将下面的链接替换为您的实际GitHub仓库地址 */}
          <a
            href="https://github.com/ALiangTech/treeify"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md text-sm transition-colors duration-200 flex items-center"
            title="查看GitHub源码"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            GitHub
          </a>
        </div>
      </div>
      {/* 上传区域 */}
      <label
            className={`bg-white dark:bg-black/[.24] rounded-lg p-6 shadow-sm border-2 ${isDragging ? 'border-blue-500 border-dashed' : 'border-black/[.08] dark:border-white/[.08]'} transition-colors duration-200 cursor-pointer min-h-[200px] flex flex-col items-center justify-center mb-6`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            htmlFor='fileInput'
          >
            <input 
              type="file" 
              id='fileInput'
              // @ts-expect-error webkitdirectory is a non-standard attribute
              webkitdirectory="true"
              className="hidden" 
              onChange={(e) => {
                const files = e.target.files;
                console.log('选择的文件数量:', files);
                
                if (files && files.length > 0) {
                  // 检查是否有webkitRelativePath属性
                  const hasRelativePath = Array.from(files).some(file => file.webkitRelativePath && file.webkitRelativePath.length > 0);
                  console.log('文件是否有相对路径:', hasRelativePath);              
                  const tree = createFileTree(files);
                  console.log('生成的文件树:', tree);                 
                  // 更新文件树状态
                  setFileTree(tree);
                } else {
                  console.log('没有选择文件');
                }
              }}
            />
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
              </svg>
              <p className="text-lg mb-2 font-medium text-gray-900 dark:text-gray-100">
                {isDragging ? '释放以上传文件夹' : '点击或拖拽文件夹到这里'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                支持文件夹拖拽上传
              </p>
            </div>
      </label>
      {/* 主内容区域 - 单列布局 */}
      <div className="flex flex-1 w-full gap-6 overflow-hidden">
  
          {/* 文件树 */}
          {fileTree && fileTree.length > 0 && (
            <div className="bg-white h-full overflow-hidden dark:bg-black/[.24] rounded-lg p-6 shadow-sm border border-black/[.08] dark:border-white/[.08] flex-1 overflow-auto">
              <h2 className="text-lg font-medium mb-4">文件结构</h2>
              <div className="overflow-x-auto">
                {fileTree.map((node, index) => (
                  <TreeNode 
                    key={`${node.name}-${index}`} 
                    node={node} 
                    style={treeStyle}
                    onVisibilityChange={handleNodeVisibilityChange}
                  />
                ))}
              </div>
            </div>
          )}
        
        {/* 目录结构文本 */}
        {fileTree && fileTree.length > 0 && (
          <div className="w-1/2 bg-white dark:bg-black/[.24] rounded-lg p-6 shadow-sm border border-black/[.08] dark:border-white/[.08] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">目录结构</h2>
              <button
                onClick={handleCopyText}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors duration-200 flex items-center"
              >
                {copySuccess ? (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    已复制
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                    </svg>
                    复制
                  </>
                )}
              </button>
            </div>
            <div className="flex-1 relative">
              <textarea
                ref={textAreaRef}
                readOnly
                value={treeText}
                className="w-full h-full p-4 font-mono text-sm bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

