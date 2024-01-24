import React, { useState } from "react";
import {
  Input,
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
interface IReadData {
  fileParent?: File;
  setFile: (file: File) => void;
}

const UploadCSV: React.FC<IReadData> = ({ fileParent, setFile }: IReadData) => {
  const [file, setFileChild] = useState<File | null | undefined>(fileParent);
  const [totalTokens, setTotalTokens] = useState<number |undefined>()
  const [canTryBatch, setCanTryBatch] = useState<boolean |undefined>(false)
  const [totalTx, setTotalTx] = useState<number|undefined>()
  const [totalRecipient, setTotalRecipient] = useState<number|undefined>()
  const [verifData, setVerificationData]  = useState<string |undefined>()
  const [csvData, setCsvData] = useState([]);
  const [error, setError] = useState(null);
  const toast = useToast();
  const accountStarknet = useAccount();
  const account = accountStarknet.account;
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [array, setArray] = useState<Uint8Array | undefined>();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileChild(e.target.files[0]);
      setFile(e.target.files[0]);
    }
  };

  const hasExpectedColumns = (jsonData: any[]): boolean => {
    // Define the expected column names
    const expectedColumns = ["token_address", "recipient", "amount"];

    // Get the columns from the first data row
    const firstRow = jsonData[0];
    if (!firstRow) return false;

    // Check if all expected columns are present
    return expectedColumns.every((col) => Object.keys(firstRow).includes(col));
  };
  const readInfo = (datas?: any[]) => {
    try {
      console.log("readInfo",datas)
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
          amount:amount,
          recipient,
          token_address:tokenAddress
        }
      });
  
      console.log("read info data", data);
      setTotalTx(data.length)
  
      /** @TODO create text verification with stats */
      /** Find unique tokens */
      let allTokens=data.map((c) => c.token_address)
      console.log("allTokens", allTokens);
  
      const tokensAddressSet = new Set(allTokens) 
      const tokensAddress = [new Set(allTokens) ]
      console.log("tokensAddressSet",tokensAddressSet.size)
      console.log("tokensAddress",tokensAddress)
      console.log("tokensAddress.length", tokensAddress.length)
  
      setTotalTokens(tokensAddressSet.size)
  
      let allRecipients=data.map((c) => c.recipient)
      /** Total amount by tokens */
  
      const totalRecipientSet = new Set(allRecipients) 
      console.log("totalRecipientSet.length", totalRecipientSet.size)
      setTotalRecipient(totalRecipientSet.size)
  
      const verifDataText = `You are about to send ${data.length} tx, with a total of ${totalRecipientSet.size} recipients, and using ${tokensAddressSet.size} tokens`
  
      setVerificationData(verifDataText)
    }catch(e) {
      console.log("Error read info",e)
    }
  

  };
  const generateBatchTxByCsv = (file: File) => {
    try {
      const formData = new FormData();
      console.log("generate Batch");
      formData.append("csv", file);
      const reader = new FileReader();
      let result;

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
          if (!hasExpectedColumns(jsonData)) {
            setError("CSV file does not have the expected columns.");
            toast({
              title: error,
              status: "warning",
            });
            return;
          }

          console.log("jsonData", jsonData);
          setCsvData(jsonData);
          readInfo(jsonData);
        } catch (error) {
          console.log("Error reading Excel file", e);
        }
      };
      const array = reader.readAsBinaryString(file);
      return result;
    } catch (e) {
      console.log("generateBatchTx Issue", e);
    }
  };

  const handleUpload = async () => {
    try {
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
        await generateBatchTxByCsv(file);
        setCanTryBatch(true)
      }
    } catch (e) {
      console.log("error generate Batch", e);
    }
  };

  return (
    <Box>
      {error && <Text>{error}</Text>}
      <Input type="file" accept=".csv" onChange={handleFileChange} />
      <Button onClick={handleUpload}>Upload CSV</Button>

      {csvData?.length > 0 &&
        csvData?.map((c, i) => {
          return <Box>{c[0]}</Box>;
        })}

      <Box py={{ base: "1em" }} width={{ base: "200px" }}>
        <BatchTxModal
          onOpen={onOpen}
          onClose={onClose}
          modalOpen={isOpen}
          csvData={csvData}
          verifData={verifData}
          isDisabledModal={canTryBatch}
        ></BatchTxModal>
      </Box>

      <Box>
        <Text> {verifData}</Text>
      </Box>

      <div>
        {error && <p>{error}</p>}
        <Table>
          <Thead>
            <Tr>
              <Th>Token address</Th>
              <Th>Amount</Th>
              <Th>Recipient</Th>
            </Tr>
          </Thead>
          <Tbody>
            {csvData &&
              csvData?.length > 0 &&
              csvData?.map((row, index) => {
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
              })}
          </Tbody>
        </Table>
      </div>
    </Box>
  );
};

export default UploadCSV;
