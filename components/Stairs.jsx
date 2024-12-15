import { animate, motion } from "framer-motion";

const stairAnimation = {
  initial: {
    top: "0%",
  },
  animate: {
    top: "100%",
  },
  exit: {
    top: ["100%", "0%"],
  },
};

const totalSteps = 6;
const reverseIndex = (index) => {
  return totalSteps - index - 1;
};

function Stairs() {
  return (
    <>
      {/* render 6 motion divs ,each representing the steps of stairs*/}
      {[...Array(6)].map((_, index) => {
        return(
        <motion.div
          key={index}
          variants={stairAnimation}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration: 0.4,
            ease: "easeInOut",
            delay: reverseIndex(index) * 0.1,
          }}
          className="h-full w-full bg-white relative"
        />
      )
      })}
    </>
  );
}

export default Stairs;
