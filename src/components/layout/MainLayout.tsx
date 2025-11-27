import React, { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * 主应用布局组件
 * 提供一致的页面容器和背景样式
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className={`container mx-auto px-4 py-6 max-w-7xl ${className}`}>
        {children}
      </div>
    </div>
  );
};

interface ContentWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * 内容包装器
 * 用于主要内容区域的白色背景卡片
 */
export const ContentWrapper: React.FC<ContentWrapperProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

interface TabContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * 标签页容器
 * 用于包装标签页内容
 */
export const TabContainer: React.FC<TabContainerProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};
