import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import Card from "./card";

const motionContainer = {
  hidden: { opacity: 1, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.1,
    },
  },
};

const motionItem = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

type Props<T> = {
  list: T[];
  getId: (item: T) => string;
  getItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  addItemCard?: React.ReactNode;
  noItemsCard?: React.ReactNode;
};

export default function Gallery<T>({
  list,
  getId,
  getItem,
  className,
  addItemCard,
  noItemsCard,
}: Props<T>) {
  return (
    <>
      <motion.ul
        className={twMerge(
          "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
          className
        )}
        variants={motionContainer}
        initial="hidden"
        animate="visible"
      >
        {addItemCard && (
          <motion.li variants={motionItem}>{addItemCard}</motion.li>
        )}
        {list.map((item, index) => (
          <motion.li key={getId(item)} variants={motionItem}>
            {getItem(item, index)}
          </motion.li>
        ))}
      </motion.ul>
      {!addItemCard && list.length === 0 && noItemsCard}
    </>
  );
}
