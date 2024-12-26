"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { sendContactForm } from "@/lib/sendContactForm";

const info = [
  {
    icon: <FaEnvelope />,
    title: "Email",
    description: "jaimauryatech@gmail.com",
  },
  {
    icon: <FaMapMarkerAlt />,
    title: "Address",
    description: "Bengaluru, India",
  },
];

function Contact() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    service: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleServiceChange = (value) => {
    setFormData({ ...formData, service: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    const response = await sendContactForm(formData);

    if (response.success) {
      setSuccess("Your message was sent successfully!");
      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        service: "",
        message: "",
      });
    } else {
      setError(response.message || "Failed to send your message.");
    }

    setLoading(false);
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { delay: 2.4, duration: 0.4, ease: "easeIn" },
      }}
      className="py-6"
    >
      <div className="container mx-auto">
        <div className="flex flex-col xl:flex-row gap-[30px]">
          <div className="xl:w-[54%] order-2 xl:order-none">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-6 p-10 bg-[#27272c] rounded-xl"
            >
              <h3 className="text-4xl text-accent">Let's work Together</h3>
              <p className="text-white/60">
                Fill in the details, and I'll get back to you!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  name="firstname"
                  type="text"
                  placeholder="Firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="lastname"
                  type="text"
                  placeholder="Lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <Select
                value={formData.service}
                onValueChange={handleServiceChange}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select a service</SelectLabel>
                    <SelectItem value="web-dev">Web Development</SelectItem>
                    <SelectItem value="coding-lessons">
                      Coding Lessons
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Textarea
                name="message"
                className="h-[200px]"
                placeholder="Type your message here."
                value={formData.message}
                onChange={handleChange}
                required
              />
              <Button
                size="md"
                className="max-w-40"
                type="submit"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send message"}
              </Button>
              {success && (
                <p className="text-green-500 mt-4">{success}</p>
              )}
              {error && <p className="text-red-500 mt-4">{error}</p>}
            </form>
          </div>
          <div className="flex-1 flex items-center xl:justify-end order-1 xl:order-none mb-8 xl:mb-0">
            <ul className="flex flex-col gap-10">
              {info.map((item, index) => (
                <li key={index} className="flex items-center gap-6">
                  <div className="w-[52px] h-[52px] xl:w-[72px] xl:h-[72px] bg-[#27272c] text-accent rounded-md flex items-center justify-center">
                    <div className="text-[28px]">{item.icon}</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-white/60">{item.title}</p>
                    <h3 className="text-xl">{item.description}</h3>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default Contact;
