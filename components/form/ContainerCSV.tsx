import { Box, Text } from "@chakra-ui/react"
import ReadCSV from "../view/ReadCSV"
import UploadCSV from "./UploadCSV"
import { useState } from "react"
import { BatchType } from "../../types"
interface IContainerCsv {
    batchType:BatchType
}
export const ContainerCSV = ({batchType}:IContainerCsv) => {

    const [file, setFile] = useState<File | undefined>()

    return (
        <Box>
            <Text>
                Let's batch your TX with a CSV
            </Text>
            <UploadCSV
                fileParent={file}
                setFile={setFile}
                batchType={batchType}

            ></UploadCSV>
            {/* <ReadCSV
            setFile={setFile}
            fileParent={file}
            
            ></ReadCSV> */}
        </Box>
    )
}