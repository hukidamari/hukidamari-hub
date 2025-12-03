"use client";

import { ComponentProps } from "react";
import { HeadingWithId } from "../../types/post";
import styles from "./table-of-contents.module.css";
import { useActiveHeading } from "@/hooks/use-active-heading";

export type TocItem = {
  title: string;
  id: string;
  children?: TocItem[];
};

type TocProps = ComponentProps<"nav"> & {
  headings: HeadingWithId[];
};

// HeadingWithId[]からTocItem[]を生成
const generateTocData = (headings: HeadingWithId[]): TocItem[] => {
  const tocItems: TocItem[] = [];
  const stack: { level: number; items: TocItem[] }[] = [
    { level: 0, items: tocItems },
  ];

  headings.forEach((heading) => {
    const tocItem: TocItem = { title: heading.text, id: heading.id };
    while (stack.length > 0 && heading.level <= stack[stack.length - 1].level) {
      stack.pop();
    }
    stack[stack.length - 1].items.push(tocItem);
    stack.push({ level: heading.level, items: (tocItem.children = []) });
  });

  return tocItems;
};

type TocItemProps = {
  item: TocItem;
  activeId: string | null;
  handleClick: (id: string) => void;
};

const TableOfContentsItem = ({ item, activeId, handleClick }: TocItemProps) => {
  const isActive = activeId === item.id;

  return (
    <li className={`${styles.tocItem} ${isActive ? styles.active : ""}`}>
      {" "}
      <a
        href={`#${item.id}`}
        onClick={(e) => {
          e.preventDefault();
          handleClick(item.id);
        }}
      >
        {item.title}{" "}
      </a>{" "}
      {item.children && item.children.length > 0 && (
        <ul className={styles.tocSub}>
          {" "}
          {item.children.map((child, idx) => (
            <TableOfContentsItem
              key={idx}
              item={child}
              activeId={activeId}
              handleClick={handleClick}
            />
          ))}{" "}
        </ul>
      )}{" "}
    </li>
  );
};

const TableOfContents = (props: TocProps) => {
  const tocData = generateTocData(props.headings);

  const { activeId, handleTocClick } = useActiveHeading(props.headings);

  return (
    <nav {...props} className={`${styles.nav} ${props.className}`}>
      <ul className={styles.toc}>
        {tocData.map((item, idx) => (
          <TableOfContentsItem
            key={idx}
            item={item}
            activeId={activeId}
            handleClick={handleTocClick} // 💡 改善点: handleClick を useActiveHeading から取得
          />
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;
