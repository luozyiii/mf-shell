import { Layout as AntLayout } from 'antd';
import type React from 'react';
import styles from './LayoutSkeleton.module.css';

const { Header, Sider, Content } = AntLayout;

export const LayoutSkeleton: React.FC = () => {
  return (
    <AntLayout className={styles.layout}>
      {/* 侧边栏骨架屏 */}
      <Sider width={200} className={styles.sider} theme="dark">
        {/* Logo区域骨架屏 */}
        <div className={styles.logoSkeleton}>
          <div className={styles.logoIcon}></div>
          <div className={styles.logoText}></div>
        </div>

        {/* 菜单骨架屏 */}
        <div className={styles.menuSkeleton}>
          {/* 主菜单项 */}
          <div className={styles.menuItem}>
            <div className={styles.menuIcon}></div>
            <div className={styles.menuLabel}></div>
          </div>

          {/* 子菜单组 */}
          <div className={styles.menuGroup}>
            <div className={styles.menuItem}>
              <div className={styles.menuIcon}></div>
              <div className={styles.menuLabel}></div>
              <div className={styles.menuArrow}></div>
            </div>
            <div className={styles.subMenuItems}>
              <div className={styles.subMenuItem}></div>
              <div className={styles.subMenuItem}></div>
              <div className={styles.subMenuItem}></div>
            </div>
          </div>

          {/* 另一个子菜单组 */}
          <div className={styles.menuGroup}>
            <div className={styles.menuItem}>
              <div className={styles.menuIcon}></div>
              <div className={styles.menuLabel}></div>
              <div className={styles.menuArrow}></div>
            </div>
            <div className={styles.subMenuItems}>
              <div className={styles.subMenuItem}></div>
              <div className={styles.subMenuItem}></div>
              <div className={styles.subMenuItem}></div>
              <div className={styles.subMenuItem}></div>
            </div>
          </div>
        </div>

        {/* 折叠按钮骨架屏 */}
        <div className={styles.collapseButtonSkeleton}>
          <div className={styles.collapseIcon}></div>
        </div>
      </Sider>

      <AntLayout>
        {/* 头部骨架屏 */}
        <Header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.pageTitleSkeleton}></div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.welcomeTextSkeleton}></div>
            <div className={styles.userInfoSkeleton}>
              <div className={styles.userAvatar}></div>
              <div className={styles.userName}></div>
            </div>
          </div>
        </Header>

        {/* 内容区域骨架屏 */}
        <Content className={styles.content}>
          <div className={styles.contentSkeleton}>
            {/* 页面标题骨架屏 */}
            <div className={styles.pageHeaderSkeleton}>
              <div className={styles.pageTitle}></div>
              <div className={styles.pageSubtitle}></div>
            </div>

            {/* 卡片网格骨架屏 */}
            <div className={styles.cardsGrid}>
              <div className={styles.cardSkeleton}>
                <div className={styles.cardHeader}></div>
                <div className={styles.cardContent}>
                  <div className={styles.cardLine}></div>
                  <div className={styles.cardLine}></div>
                  <div className={styles.cardLine}></div>
                </div>
              </div>
              <div className={styles.cardSkeleton}>
                <div className={styles.cardHeader}></div>
                <div className={styles.cardContent}>
                  <div className={styles.cardLine}></div>
                  <div className={styles.cardLine}></div>
                  <div className={styles.cardLine}></div>
                </div>
              </div>
              <div className={styles.cardSkeleton}>
                <div className={styles.cardHeader}></div>
                <div className={styles.cardContent}>
                  <div className={styles.cardLine}></div>
                  <div className={styles.cardLine}></div>
                  <div className={styles.cardLine}></div>
                </div>
              </div>
            </div>

            {/* 表格骨架屏 */}
            <div className={styles.tableSkeleton}>
              <div className={styles.tableHeader}>
                <div className={styles.tableHeaderCell}></div>
                <div className={styles.tableHeaderCell}></div>
                <div className={styles.tableHeaderCell}></div>
                <div className={styles.tableHeaderCell}></div>
              </div>
              <div className={styles.tableBody}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={`skeleton-row-${index}`}
                    className={styles.tableRow}
                  >
                    <div className={styles.tableCell}></div>
                    <div className={styles.tableCell}></div>
                    <div className={styles.tableCell}></div>
                    <div className={styles.tableCell}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};
