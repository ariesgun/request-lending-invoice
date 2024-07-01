/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useConnectWallet } from "@web3-onboard/react";
import { ArrowUpRight } from "@/icons";
import { Button, Dropdown } from "../common";
import { truncateAddress } from "@/utils/walletUtils";

const Navbar = () => {
  const router = useRouter();
  const [{ wallet }, connect] = useConnectWallet();
  const [isDocsHovered, setIsDocsHovered] = useState(false);
  const [text, setText] = useState("Connect Wallet");

  const links = [
    {
      name: "My dashboard",
      href: "/",
    },
    {
      name: "Invoice Dashboard",
      href: "/dashboard",
    },
    {
      name: "Invoice Financing Marketplace",
      href: "/marketplace",
    },
  ];

  const supportLinks = [
    {
      name: "Github Discussions",
      href: "https://github.com/orgs/RequestNetwork/discussions",
    },
    {
      name: "Discord",
      href: "https://discord.com/channels/468974345222619136/1103420140181274645",
    },
  ];

  useEffect(() => {
    if (wallet) {
      setText(truncateAddress(wallet.accounts[0].address));
    }
  }, [wallet]);

  return (
    <nav className="h-full flex items-center p-[20px] gap-[60px] bg-white shadow-small mb-[80px]">
      <Link
        target="_blank"
        rel="noreferrer noopener"
        href="https://request.network/"
      >
        <img
          src="assets/logo.svg"
          alt="Request Network Logo"
          className="w-[120px]"
        />
      </Link>
      <ul className="h-full flex gap-[60px]">
        {links.map((link, index) => (
          <li className={`h-full relative text-black`} key={index}>
            <Link href={link.href}>{link.name}</Link>
            <div
              className={`${
                router.pathname === link.href &&
                "h-[4px] bg-green-900 w-full absolute bottom-[-28px]"
              }`}
            ></div>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-[35px] ml-auto">
        <div
          onMouseEnter={() => setIsDocsHovered(true)}
          onMouseLeave={() => setIsDocsHovered(false)}
        >
          <div
            className={`${
              isDocsHovered ? "h-[1.5px]" : "h-[0px]"
            } w-100 bg-green-800`}
          ></div>
        </div>
        {/* <Dropdown title="Need help?" items={supportLinks} /> */}
        <Button
          text={text}
          onClick={() => {
            connect();
          }}
        />
      </div>
    </nav>
  );
};

export default Navbar;
