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
import {
  ERC20_EXPECTED_COLUMNS,
  ERC721_EXPECTED_COLUMNS,
  hasExpectedColumns,
  hasExpectedColumnsERC721,
} from "../../utils/csv";
import TableCsvView from "./TableCsvView";
import {
  generateERC20SummaryData,
  generateERC721SummaryData,
} from "../../utils/generate_text";
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
          const {verificationData, summaryData, summaryNode}= generateERC20SummaryData(
            tokensAddressSet,
            datas,
            verifDataText,
            batchType
          );
          setSummaryNode(summaryNode);
          setSummaryData(summaryData);
          setVerificationData(verificationData);
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
          const { summaryNode, summaryData, verificationData } =
            generateERC721SummaryData(
              tokensAddressSet,
              datas,
              verifDataText,
              batchType
            );
          setSummaryNode(summaryNode);
          setSummaryData(summaryData);
          setVerificationData(verificationData);
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
      <Text fontSize={{ base: "15px", md: "19px" }}>
        {" "}
        Select if you want to batch ERC20 (token) or ERC721 (NFT)
      </Text>

      {batchType == BatchType.ERC20 ? (
        <Box>
          <Text>Columns expected for ERC20</Text>
          <Text>{ERC20_EXPECTED_COLUMNS}</Text>
        </Box>
      ) : (
        <Box>
          <Text>Columns expected for ERC721</Text>
          <Text>{ERC721_EXPECTED_COLUMNS}</Text>
        </Box>
      )}
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

      <TableCsvView
        csvData={csvData}
        error={error}
        batchType={batchType}
      ></TableCsvView>
    </Box>
  );
};

export default UploadCSV;
