import { FaGithub, FaLinkedinIn, FaTwitter } from "react-icons/fa";

const socials = [
  { icon: <FaGithub />, path: "https://github.com/jai0651" },
  { icon: <FaLinkedinIn />, path: "https://www.linkedin.com/in/jai-shankar-b7b388234/" },
  { icon: <FaTwitter />, path: "https://x.com/jaimauryatech2" }
];

function Social({ containerStyles, iconStyles }) {
  return (
    <div className={containerStyles}>
      {socials.map((item, index) => (
        <a
          key={index}
          href={item.path}
          target="_blank"
          rel="noopener noreferrer"
          className={iconStyles}
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
}

export default Social;
