import { PrismaClient, Prisma } from '@prisma/client';
import fs from 'fs';
import csv from 'csv-parser';
import xlsx from 'xlsx';
import { GetImsiCapturesQueryInput } from '../schemas/imsi.schema';

const prisma = new PrismaClient();

export async function getAllImsiCaptures(
  query: GetImsiCapturesQueryInput,
  userId: string
) {
  const page = parseInt(query.page || '1');
  const limit = parseInt(query.limit || '10');
  const search = query.search;
  const skip = (page - 1) * limit;

  const baseWhere: Prisma.IMSICaptureWhereInput = {  };

  const searchWhere: Prisma.IMSICaptureWhereInput | null = search
    ? {
        OR: [
          { imsi: { contains: search, mode: 'insensitive' } },
          { imei: { contains: search, mode: 'insensitive' } },
          { msisdn: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
          { operator: { contains: search, mode: 'insensitive' } },
        ],
      }
    : null;
    
  const where: Prisma.IMSICaptureWhereInput = searchWhere
    ? { AND: [baseWhere, searchWhere] }
    : baseWhere;

  const [captures, total] = await prisma.$transaction([
    prisma.iMSICapture.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        timestamp: 'desc',
      },
    }),
    prisma.iMSICapture.count({ where }),
  ]);

  return {
    captures,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function importIMSIFromFile(filePath: string, fileType: string, userId: string): Promise<number> {
  const records: any[] = [];
  
  if (fileType === 'text/csv') {
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath).pipe(csv())
        .on('data', (row) => records.push({
            imsi: row.IMSI, imei: row.IMEI || 'N/A', msisdn: row.MSISDN,
            timestamp: new Date(row.Timestamp), location: row.Location,
            signalDBM: parseInt(row.SignalDBM || '0'), operator: row.Operator,
            source: 'IMPORT', userId: userId,
        }))
        .on('end', resolve).on('error', reject);
    });
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    jsonData.forEach((row: any) => records.push({
        imsi: String(row.IMSI), 
        imei: String(row.IMEI || 'N/A'), 
        msisdn: String(row.MSISDN),
        timestamp: new Date(row['Collection Time']), 
        location: row['Location Name'],
        signalDBM: parseInt(row.SignalDBM || '0'), 
        operator: row.Operator,
        source: 'IMPORT', userId: userId,
    }));
  } else {
    throw new Error('Unsupported file type.');
  }
  
  fs.unlinkSync(filePath); // Clean up uploaded file

  if (records.length === 0) return 0;

  const result = await prisma.iMSICapture.createMany({
    data: records,
  });

  return result.count;
}