import React, { useState } from "react";
import {
  Text,
  Box,
  Button,
  useToast,
  Table,
  Thead,
  Td,
  Tbody,
  Th,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import * as xlsx from "xlsx";
import { useAccount } from "@starknet-react/core";
import BatchTxModal from "../modal/batch-tx";
import { BatchType } from "../../types";
import { hasExpectedColumns, hasExpectedColumnsERC721 } from "../../utils/csv";
interface IReadData {
  fileParent?: File;
  setFile: (file: File) => void;
  // batchType: BatchType;
}

const UploadCSV: React.FC<IReadData> = ({
  fileParent,
  setFile,
}: // batchType,
IReadData) => {
  const [file, setFileChild] = useState<File | null | undefined>(fileParent);
  const [batchType, setBatchType] = useState<BatchType>(BatchType.ERC20);

  const [totalTokens, setTotalTokens] = useState<number | undefined>();
  const [canTryBatch, setCanTryBatch] = useState<boolean | undefined>(false);
  const [totalTx, setTotalTx] = useState<number | undefined>();
  const [totalRecipient, setTotalRecipient] = useState<number | undefined>();
  const [verifData, setVerificationData] = useState<string | undefined>();

  const [summaryData, setSummaryData] = useState<string | undefined>();
  const [summaryNode, setSummaryNode] = useState<React.ReactNode | undefined>();
  const [csvData, setCsvData] = useState([]);
  const [error, setError] = useState(null);
  const toast = useToast();
  const accountStarknet = useAccount();
  const account = accountStarknet.account;
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [array, setArray] = useState<Uint8Array | undefined>();

  const handleCloseModal = () => {
    setCsvData([]);
    setCanTryBatch(false);
    setVerificationData(undefined);
    setSummaryData(undefined);
    onClose();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileChild(e.target.files[0]);
      setFile(e.target.files[0]);
    }
  };

  const generateSummaryData = (
    tokensAddressSet: Set<string>,
    datas: any[],
    verifDataText: string
  ) => {
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

    setSummaryNode(SummaryNode);
    setSummaryData(summaryData);
    setVerificationData(verifDataText);
  };

  const generateERC721SummaryData = (
    tokensAddressSet: Set<string>,
    datas: any[],
    verifDataText: string
  ) => {
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

    setSummaryNode(SummaryNode);
    setSummaryData(summaryData);
    setVerificationData(verifDataText);
  };
  const readInfo = (datas?: any[]) => {
    try {
      console.log("readInfo", datas);

      if (batchType == BatchType.ERC20) {
        const data = datas?.map((row, index) => {
          console.log("index", index);
          console.log("row", row);
          const tokenAddress = String(row["token_address"]);
          const lenTokenAddress = String(tokenAddress).length;
          console.log("tokenAddress", tokenAddress);

          const recipient = String(row["recipient"]);
          console.log("recipient", recipient);

          const lenRecipientAddress = String(recipient).length;

          const amount = String(row["amount"]);
          console.log("amount", amount);

          console.log("lenTokenAddress", lenTokenAddress);

          return {
            amount: amount,
            recipient,
            token_address: tokenAddress,
          };
        });

        console.log("read info data", data);
        setTotalTx(data.length);

        /** @TODO create text verification with stats */
        /** Find unique tokens */
        let allTokens = data.map((c) => c.token_address);

        const tokensAddressSet = new Set(allTokens);
        const tokensAddress = [new Set(allTokens)];
        setTotalTokens(tokensAddressSet.size);

        let allRecipients = data.map((c) => c.recipient);
        /** Total amount by tokens */
        const totalRecipientSet = new Set(allRecipients);
        console.log("totalRecipientSet.length", totalRecipientSet.size);
        setTotalRecipient(totalRecipientSet.size);

        let verifDataText = `You are about to send ${data.length} tx, with a total of ${totalRecipientSet.size} recipients, and using ${tokensAddressSet.size} tokens. \n`;
        /** TODO calculation amount by tokens */
        setVerificationData(verifDataText);

        if (batchType == BatchType.ERC20) {
          generateSummaryData(tokensAddressSet, datas, verifDataText);
        }

        setCanTryBatch(true);
      } else if (batchType == BatchType.ERC721) {
        const data = datas?.map((row, index) => {
          console.log("index", index);
          console.log("row", row);
          const tokenAddress = String(row["token_address"]);
          const lenTokenAddress = String(tokenAddress).length;
          console.log("tokenAddress", tokenAddress);

          const recipient = String(row["recipient"]);
          console.log("recipient", recipient);

          const lenRecipientAddress = String(recipient).length;

          const token_id = String(row["token_id"]);
          console.log("amount", token_id);

          console.log("lenTokenAddress", lenTokenAddress);

          return {
            token_id: token_id,
            recipient,
            token_address: tokenAddress,
          };
        });

        setTotalTx(data.length);

        /** @TODO create text verification with stats */
        /** Find unique tokens */
        let allTokens = data.map((c) => c.token_address);
        // console.log("allTokens", allTokens);

        const tokensAddressSet = new Set(allTokens);
        const tokensAddress = [new Set(allTokens)];

        setTotalTokens(tokensAddressSet.size);

        let allRecipients = data.map((c) => c.recipient);
        /** Total amount by tokens */

        const totalRecipientSet = new Set(allRecipients);
        setTotalRecipient(totalRecipientSet.size);

        let verifDataText = `You are about to send ${data.length} tx, with a total of ${totalRecipientSet.size} recipients, and using ${tokensAddressSet.size} tokens. \n`;
        /** TODO calculation amount by tokens */
        setVerificationData(verifDataText);

        if (batchType == BatchType.ERC721) {
          generateERC721SummaryData(tokensAddressSet, datas, verifDataText);
        }

        setCanTryBatch(true);
      }
    } catch (e) {
      console.log("Error read info", e);
    }
  };
  const generateBatchTxByCsv = (file: File) => {
    try {
      const formData = new FormData();
      console.log("generate Batch");
      formData.append("csv", file);
      const reader = new FileReader();
      let result;
      setError(undefined);

      reader.onloadend = (e) => {
        try {
          const workbook = xlsx.read(e.target.result, { type: "string" });
          console.log("workbook", workbook);
          const sheetName = workbook.SheetNames[0];
          console.log("sheetName", sheetName);
          const worksheet = workbook.Sheets[sheetName];
          console.log("worksheet", worksheet);
          const jsonData = xlsx.utils.sheet_to_json(worksheet, { raw: false });
          console.log("jsonData", jsonData);

          if (batchType == BatchType.ERC20) {
            if (!hasExpectedColumns(jsonData)) {
              setError("CSV file does not have the expected columns.");
              toast({
                title: error,
                status: "warning",
              });
              return;
            }
          } else {
            if (!hasExpectedColumnsERC721(jsonData)) {
              setError("CSV file does not have the expected columns.");
              toast({
                title: error,
                status: "warning",
              });
              return;
            }
          }
          console.log("jsonData", jsonData);
          setCsvData(jsonData);
          readInfo(jsonData);
        } catch (error) {
          console.log("Error reading Excel file", e);
        }
      };
      const array = reader.readAsBinaryString(file);
      return {
        isGenerate: true,
      };
    } catch (e) {
      console.log("generateBatchTx Issue", e);
      return {};
    }
  };

  const handleUpload = async () => {
    try {
      console.log("handke upload");
      if (!file) {
        toast({
          title:
            "Please upload a csv with these columns: token_address,recipient,amount",
          status: "warning",
        });
      }
      if (file) {
        toast({
          title: "Uploading your CSV and generate your transfers",
        });
        const formData = new FormData();
        formData.append("csv", file);
        let { isGenerate } = await generateBatchTxByCsv(file);
        console.log("generate batch tx done");
        // if (isGenerate) {
        //   setCanTryBatch(true);
        // }
      }
    } catch (e) {
      console.log("error generate Batch", e);
    }
  };

  return (
    <Box>
      <Box
        py={{ base: "0.5em" }}
        display={{ base: "flex" }}
        gap={{ base: "0.5em" }}
      >
        <Button
          background={batchType == BatchType.ERC20 && "brand.primary"}
          onClick={() => {
            setBatchType(BatchType.ERC20);
            setCanTryBatch(false);
          }}
        >
          ERC20
        </Button>
        <Button
          background={batchType == BatchType.ERC721 && "brand.primary"}
          onClick={() => {
            setBatchType(BatchType.ERC721);
            setCanTryBatch(false);
          }}
        >
          ERC721
        </Button>
      </Box>
      {error && <Text>{error}</Text>}

      <input type="file" accept=".csv" onChange={handleFileChange} />
      <Button py={{ base: "0.5em" }} onClick={handleUpload}>
        Upload CSV
      </Button>

      <Box py={{ base: "1em", md: "2em" }} width={{ base: "200px" }}>
        <BatchTxModal
          onOpen={onOpen}
          onClose={handleCloseModal}
          modalOpen={isOpen}
          csvData={csvData}
          verifData={verifData}
          isDisabledModal={canTryBatch}
          summaryData={summaryData}
          isCanTryBatch={canTryBatch}
          batchType={batchType}
          summaryNode={summaryNode}
        ></BatchTxModal>
      </Box>

      <Box>
        <Text> {verifData}</Text>
      </Box>
      <Box>
        <Text> {summaryData}</Text>
      </Box>

      <div>
        {error && <p>{error}</p>}
        <Table>
          <Thead>
            <Tr>
              <Th>Token address</Th>
              <Th>{batchType == BatchType.ERC20 ? "Amount" : "Token id"}</Th>
              <Th>Recipient</Th>
            </Tr>
          </Thead>
          <Tbody>
            {csvData &&
              csvData?.length > 0 &&
              csvData?.map((row, index) => {
                if (batchType == BatchType.ERC20) {
                  const tokenAddress = String(row["token_address"]);
                  const lenTokenAddress = String(tokenAddress).length;
                  const recipient = String(row["recipient"]);
                  const lenRecipientAddress = String(recipient).length;
                  const amount = String(row["amount"]);
                  return (
                    <tr key={index}>
                      <Td>
                        {tokenAddress.slice(0, 10)} ...
                        {tokenAddress.slice(
                          lenTokenAddress - 10,
                          lenTokenAddress
                        )}{" "}
                      </Td>
                      <Td>{amount}</Td>
                      <Td>
                        {recipient.slice(0, 10)} ...{" "}
                        {recipient.slice(
                          lenRecipientAddress - 10,
                          lenRecipientAddress
                        )}
                      </Td>
                    </tr>
                  );
                } else if (batchType == BatchType.ERC721) {
                  const tokenAddress = String(row["token_address"]);
                  const lenTokenAddress = String(tokenAddress).length;
                  const recipient = String(row["recipient"]);
                  const lenRecipientAddress = String(recipient).length;
                  const token_id = String(row["token_id"]);
                  return (
                    <tr key={index}>
                      <Td>
                        {tokenAddress.slice(0, 10)} ...
                        {tokenAddress.slice(
                          lenTokenAddress - 10,
                          lenTokenAddress
                        )}{" "}
                      </Td>
                      <Td>{token_id}</Td>
                      <Td>
                        {recipient.slice(0, 10)} ...{" "}
                        {recipient.slice(
                          lenRecipientAddress - 10,
                          lenRecipientAddress
                        )}
                      </Td>
                    </tr>
                  );
                }
              })}
          </Tbody>
        </Table>
      </div>
    </Box>
  );
};

export default UploadCSV;
