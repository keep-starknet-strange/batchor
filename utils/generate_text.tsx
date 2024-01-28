import { Box, Text } from "@chakra-ui/react";
import { BatchType } from "../types";

export const generateERC20SummaryData = (
  tokensAddressSet: Set<string>,
  datas: any[],
  verifDataText: string,
  batchType: BatchType
): {
  summaryData?: string,
  summaryNode?: React.ReactNode,
  verificationData?: string,
} => {
  let sumAmountByToken: Map<string, number> = new Map();
  if (batchType == BatchType?.ERC20) {
    for (let contractAddress of Array.from(tokensAddressSet.values())) {
      sumAmountByToken[contractAddress] = 0;
      sumAmountByToken.set(contractAddress, 0);
      datas?.filter((callData) => {
        if (callData?.token_address == contractAddress) {
          let amount = Number(callData?.amount);
          const value = sumAmountByToken.get(contractAddress);
          sumAmountByToken.set(contractAddress, amount + value);
          return callData?.amount;
        }
      });
    }
  }
  // let summaryData = `Sum amount by tokens :\n`;
  /** @TODO add React node */
  let allText = Array.from(sumAmountByToken.keys()).map((key) => {
    const value = sumAmountByToken.get(key);
    const keyLen = key.length;
    const truncAddress = `${key.slice(0, 10)}...${key.slice(
      keyLen - 10,
      keyLen
    )} `;
    let text = `${truncAddress} : ${value}\n`;
    // summaryData +=text
    return text;
  });
  const SummaryNode = (
    <Box>
      <Text>Sum amount by tokens </Text>
      {allText?.map((t, i) => {
        return <Text key={i}>{t}</Text>;
      })}
    </Box>
  );

  // setSummaryNode(SummaryNode);
  // setSummaryData(summaryData);
  // setVerificationData(verifDataText);
  return {
    // summaryData:summaryData,
    verificationData:verifDataText,
    summaryNode:SummaryNode
  }
};

export const generateERC721SummaryData =  (
  tokensAddressSet: Set<string>,
  datas: any[],
  verifDataText: string,
  batchType: BatchType
): {
  summaryData?: string,
  summaryNode?: React.ReactNode,
  verificationData?: string,
} => {
  let sumAmountByToken: Map<string, number> = new Map();
  if (batchType == BatchType?.ERC721) {
    for (let contractAddress of Array.from(tokensAddressSet.values())) {
      sumAmountByToken[contractAddress] = 0;
      sumAmountByToken.set(contractAddress, 0);
      datas?.filter((callData) => {
        if (callData?.token_address == contractAddress) {
          const value = sumAmountByToken.get(contractAddress);
          sumAmountByToken.set(contractAddress, 1 + value);
          return callData?.amount;
        }
      });
    }
  }
  // let summaryData = `Sum amount by tokens :\n`;
  /** @TODO add React node */
  let allText = Array.from(sumAmountByToken.keys()).map((key) => {
    const value = sumAmountByToken.get(key);
    const keyLen = key.length;
    const truncAddress = `${key.slice(0, 10)}...${key.slice(
      keyLen - 10,
      keyLen
    )} `;
    let text = `${truncAddress} : ${value}\n`;
    // summaryData +=text
    return text;
  });
  const SummaryNode = (
    <Box>
      <Text>Sum amount by tokens </Text>
      {allText?.map((t, i) => {
        return <Text key={i}>{t}</Text>;
      })}
    </Box>
  );


  return {
    // summaryData:summaryData,
    verificationData:verifDataText,
    summaryNode:SummaryNode
  }
};
