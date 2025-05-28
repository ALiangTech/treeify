# Components

此目录用于存放全局组件，包含以下子目录：

- `common/`: 通用组件，如按钮、输入框、卡片等基础组件
- `layout/`: 布局组件，如页面布局、导航栏、页脚等
- `ui/`: UI组件，如模态框、提示框、加载动画等界面组件

## 使用指南

1. 组件应遵循单一职责原则
2. 每个组件都应该有其独立的目录
3. 组件目录中应包含组件本身和相关的样式文件
4. 复杂组件可以包含子组件

## 目录结构示例

```
components/
├── common/
│   └── Button/
│       ├── Button.tsx
│       └── Button.module.css
├── layout/
│   └── Header/
│       ├── Header.tsx
│       └── Header.module.css
└── ui/
    └── Modal/
        ├── Modal.tsx
        └── Modal.module.css
```