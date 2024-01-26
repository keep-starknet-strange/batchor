import type { NextPage } from "next";
import {
  Box,
  Image,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import HeaderSEO from "../components/HeaderSEO";
import { CONFIG_WEBSITE } from "../constants";
import AccountView from "../components/starknet/AccountView";
import { ContainerCSV } from "../components/form/ContainerCSV";
import { BatchType } from "../types";
import { useState } from "react";

const Home: NextPage = ({}) => {
  const color = useColorModeValue("gray.900", "gray.300");

  return (
    <>
      <HeaderSEO></HeaderSEO>

      <Box
        height={"100%"}
        width={"100%"}
        minH={{ sm: "70vh" }}
        overflow={"hidden"}
        alignContent={"center"}
        justifyItems={"center"}
        justifyContent={"center"}
        alignItems={"center"}
        textAlign={"center"}
      >
        <Box display={{ lg: "flex" }} justifyContent={"space-between"}>
          <Box
            textAlign={{ base: "left", md: "center" }}
            p={{ base: "1em" }}
            minH={{ sm: "70vh" }}
            minW={{ lg: "950px" }}
            px={{ base: "1em" }}
            color={color}
          >
            <Box textAlign={"left"} py={{ base: "0.5em" }}>
              <Image src="/assets/starknet_logo.svg"></Image>
              <Text
                fontFamily={"PressStart2P"}
                fontSize={{ base: "19px", md: "23px", lg: "27px" }}
              >
                {CONFIG_WEBSITE.title}✨
              </Text>
              <Text
              fontFamily="monospace"
              >{CONFIG_WEBSITE.description}</Text>

              <Box>
                <Text fontFamily="PressStart2P">
                  Batch easily your transactions
                </Text>

                <ContainerCSV
                // batchType={batchType}
                ></ContainerCSV>
              </Box>

              <Box
                gap="1em"
              >
                <AccountView></AccountView>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Home;
