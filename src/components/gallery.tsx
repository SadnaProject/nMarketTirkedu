import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

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
  getItem: (item: T) => React.ReactNode;
  className?: string;
};

export default function Gallery<T>({
  list,
  getId,
  getItem,
  className,
}: Props<T>) {
  return (
    <motion.ul
      className={twMerge(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
      variants={motionContainer}
      initial="hidden"
      animate="visible"
    >
      {list.map((item) => (
        <motion.li key={getId(item)} variants={motionItem}>
          {getItem(item)}
        </motion.li>
      ))}
    </motion.ul>
  );
}
