import React, { useState } from 'react';
import * as XLSX from 'xlsx';


interface IReadData {
    fileParent?: File
    setFile: (file: File) => void
    csvData:any[]
}
const ReadData: React.FC<IReadData> = ({ fileParent, csvData }: IReadData) => {
    const [xlsxData, setXLSXData] = useState<any[]>(csvData);
    console.log("xlsxData",xlsxData)
    const [error, setError] = useState<string | null>(null);
    const [file, setFileChild] = useState<File | undefined>(fileParent)

    // const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //     // const file = e.target.files?.[0];
    //     if (!file) return;

    //     try {
    //         const workbook = await XLSX.read(file, { type: 'binary' });
    //         const sheetName = workbook.SheetNames[0];
    //         const worksheet = workbook.Sheets[sheetName];
    //         const data = XLSX.utils.sheet_to_json(worksheet);

    //         setXLSXData(data);
    //         setError(null);
    //     } catch (e) {
    //         setError('Error reading XLSX file');
    //     }
    // };

    return (
        <div>
            {/* <input type="file" accept=".xlsx" onChange={handleFileChange} /> */}
            {error && <p>{error}</p>}
            <table>
                <thead>
                    <tr>
                        <th>Column 1</th>
                        <th>Column 2</th>
                        {/* Add more headers as needed */}
                    </tr>
                </thead>
                <tbody>
                    {xlsxData && xlsxData?.length>0 &&
                     xlsxData?.map((row, index) => {
                        console.log("index",index)
                        console.log("row",row)
                        return (
                            <tr key={index}>
                                <td>{row["token_address"].toString()}</td>
                                <td>{row["recipient"]}</td>
                                <td>{row["amount"]}</td>
                                {/* Display other columns as needed */}
                            </tr>
                        )
                    }

                    )
                    }
                </tbody>
            </table>
        </div>
    );
};

export default ReadData;
