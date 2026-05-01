import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { Order } from "./orders";
import { Category } from "./categories";

export const exportToExcel = (orders: Order[]) => {
  const data = orders.map((order) => ({
    Nama: order.name,
    Telepon: order.phone,
    Status: order.status,
    ...order.data, // Flatten dynamic fields
    "Tanggal Dibuat": order.createdAt ? format(new Date(order.createdAt), "dd/MM/yyyy HH:mm") : "-",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
  
  XLSX.writeFile(workbook, `Orders_${format(new Date(), "yyyy-MM-dd_HHmm")}.xlsx`);
};

export const exportToPDF = (orders: Order[]) => {
  const doc = new jsPDF();
  
  // Extract all unique headers from dynamic data
  const dynamicKeys = Array.from(new Set(orders.flatMap(o => Object.keys(o.data || {}))));
  const tableColumn = ["No", "Nama", "Telepon", "Status", ...dynamicKeys, "Tanggal"];
  const tableRows: any[] = [];

  orders.forEach((order, index) => {
    const orderData = [
      index + 1,
      order.name,
      order.phone,
      order.status,
      ...dynamicKeys.map(key => order.data?.[key] || "-"),
      order.createdAt ? format(new Date(order.createdAt), "dd/MM/yyyy") : "-",
    ];
    tableRows.push(orderData);
  });

  doc.text("OrderFlow - Management Report", 14, 15);
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 20,
  });
  
  doc.save(`Orders_${format(new Date(), "yyyy-MM-dd_HHmm")}.pdf`);
};

export const exportCategoriesToExcel = (categories: Category[]) => {
  const data = categories.map((category) => ({
    Nama: category.name,
    Tipe: category.type || "-",
    Status: category.status || "-",
    "Harga/Pc": category.pricePerPc ?? 0,
    Ikon: category.icon || "Package",
    "Tanggal Dibuat": category.createdAt
      ? format(new Date(category.createdAt), "dd/MM/yyyy HH:mm")
      : "-",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");

  XLSX.writeFile(workbook, `Categories_${format(new Date(), "yyyy-MM-dd_HHmm")}.xlsx`);
};

export const exportCategoriesToPDF = (categories: Category[]) => {
  const doc = new jsPDF();
  const tableColumn = ["No", "Nama", "Tipe", "Status", "Harga/Pc", "Ikon", "Tanggal"];
  const tableRows: Array<Array<string | number>> = [];

  categories.forEach((category, index) => {
    tableRows.push([
      index + 1,
      category.name,
      category.type || "-",
      category.status || "-",
      `Rp ${(category.pricePerPc ?? 0).toLocaleString("id-ID")}`,
      category.icon || "Package",
      category.createdAt ? format(new Date(category.createdAt), "dd/MM/yyyy") : "-",
    ]);
  });

  doc.text("OrderFlow - Categories Report", 14, 15);
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 20,
  });

  doc.save(`Categories_${format(new Date(), "yyyy-MM-dd_HHmm")}.pdf`);
};

export const importFromExcel = (file: File): Promise<Omit<Order, "id" | "createdAt" | "updatedAt">[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        const orders = json.map((row) => {
          const { Nama, name, Telepon, phone, Status, status, categoryId, ...rest } = row;
          return {
            name: Nama || name || "",
            phone: String(Telepon || phone || ""),
            status: (Status || status || "Belum Lunas") as any,
            categoryId: categoryId || "",
            data: rest, // All other fields go into dynamic data
          };
        });
        
        resolve(orders);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};
