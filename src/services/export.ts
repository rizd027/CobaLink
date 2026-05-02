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
  
  const fileName = `Orders_${format(new Date(), "yyyy-MM-dd_HHmm")}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportToPDF = (orders: Order[]) => {
  const dynamicKeys = Array.from(new Set(orders.flatMap(o => Object.keys(o.data || {}))));
  const totalCols = 5 + dynamicKeys.length;
  const orientation = totalCols > 7 ? "l" : "p";
  const doc = new jsPDF(orientation);
  
  const tableColumn = ["No", "Nama", "Telepon", "Status", ...dynamicKeys, "Tanggal"];
  const tableRows: any[] = [];

  orders.forEach((order, index) => {
    const orderData = [
      index + 1,
      order.name,
      order.phone,
      order.status,
      ...dynamicKeys.map(key => {
        const val = order.data?.[key] || "-";
        if (typeof val === "string" && val.startsWith("http")) return "VIEW IMAGE";
        return val;
      }),
      order.createdAt ? format(new Date(order.createdAt), "dd/MM/yyyy") : "-",
    ];
    tableRows.push(orderData);
  });

  // ── BRANDING HEADER ──
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // "ORDER FLOW"
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(6, 78, 59); // Emerald-900
  doc.text("ORDER FLOW", 14, 22);
  
  // "DIGITAL RECEIPT SYSTEM"
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text("DIGITAL RECEIPT SYSTEM", 14, 28, { charSpace: 1.5 });

  // Metadata right-aligned
  doc.setFontSize(8);
  doc.text(`Export: ${format(new Date(), "dd MMMM yyyy, HH:mm")}`, pageWidth - 14, 22, { align: "right" });
  doc.text(`Total: ${orders.length} Records`, pageWidth - 14, 27, { align: "right" });
  
  // Horizontal line
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 35, pageWidth - 14, 35);

  // Subtitle / Report Type
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85); // Slate-700
  doc.text("ORDER MANAGEMENT REPORT", 14, 42);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 48,
    theme: "grid",
    headStyles: {
      fillColor: [6, 78, 59], // Matching Emerald-900
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
      halign: "center"
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      valign: "middle"
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
    }
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
      category.icon?.startsWith("http") ? "CUSTOM" : (category.icon || "Package"),
      category.createdAt ? format(new Date(category.createdAt), "dd/MM/yyyy") : "-",
    ]);
  });

  // ── BRANDING HEADER ──
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(6, 78, 59);
  doc.text("ORDER FLOW", 14, 22);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("DIGITAL RECEIPT SYSTEM", 14, 28, { charSpace: 1.5 });

  doc.setFontSize(8);
  doc.text(`Export: ${format(new Date(), "dd MMMM yyyy, HH:mm")}`, pageWidth - 14, 22, { align: "right" });
  doc.text(`Total: ${categories.length} Categories`, pageWidth - 14, 27, { align: "right" });
  
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 35, pageWidth - 14, 35);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("CATEGORIES SUMMARY REPORT", 14, 42);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 48,
    theme: "grid",
    headStyles: {
      fillColor: [6, 78, 59],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold"
    },
    styles: {
      fontSize: 8,
      cellPadding: 3
    }
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
