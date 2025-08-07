import React, { useState, useEffect } from 'react';
import { Calculator, FileText, User, DollarSign, Download, AlertCircle, MapPin, Globe, CheckCircle, Users, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function USATaxSoftware2025() {
  const [language, setLanguage] = useState('en');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    ssn: '',
    filingStatus: 'single',
    address: '',
    dependents: 0,
    isMaryland: true,
    county: 'Baltimore City'
  });

  const [spouseInfo, setSpouseInfo] = useState({
    firstName: '',
    lastName: '',
    ssn: '',
    wages: "",
    interestIncome: "",
    dividends: "",
    capitalGains: "",
    businessIncome: "",
    otherIncome: "",
    federalWithholding: "",
    stateWithholding: ""
  });

  const [showSpouseDialog, setShowSpouseDialog] = useState(false);
  const [filingComparison, setFilingComparison] = useState(null);

  const [incomeData, setIncomeData] = useState({
    wages: "",
    interestIncome: "",
    dividends: "",
    capitalGains: "",
    businessIncome: "",
    otherIncome: ""
  });

  // K-1 Forms data
  const [k1Data, setK1Data] = useState({
    ordinaryIncome: "",
    netRentalRealEstate: "",
    otherRentalIncome: "",
    guaranteedPayments: "",
    k1InterestIncome: "",
    k1Dividends: "",
    royalties: "",
    netShortTermCapitalGain: "",
    netLongTermCapitalGain: "",
    otherPortfolioIncome: ""
  });

  // Detailed Business Income data (Schedule C)
  const [businessDetails, setBusinessDetails] = useState({
    grossReceipts: "",
    costOfGoodsSold: "",
    businessExpenses: ""
  });

  const [paymentsData, setPaymentsData] = useState({
    federalWithholding: "",
    stateWithholding: "",
    estimatedTaxPayments: "",
    priorYearOverpayment: "",
    otherPayments: ""
  });

  const [deductions, setDeductions] = useState({
    useStandardDeduction: true,
    standardDeduction: 15750,
    itemizedTotal: 0,
    mortgageInterest: "",
    stateLocalTaxes: "",
    charitableContributions: "",
    medicalExpenses: "",
    otherItemized: ""
  });

  const [taxResult, setTaxResult] = useState({
    adjustedGrossIncome: 0,
    taxableIncome: 0,
    federalTax: 0,
    marylandTax: 0,
    localTax: 0,
    totalTax: 0,
    totalPayments: 0,
    refundAmount: 0,
    amountOwed: 0,
    effectiveRate: 0,
    marginalRate: 0,
    afterTaxIncome: 0
  });

  const [activeTab, setActiveTab] = useState('personal');

  // Translation object
  const translations = {
    en: {
      title: "US Federal & Maryland Tax Calculator 2025",
      subtitle: "Calculate your 2025 federal and Maryland state income tax with updated rates and deductions",
      disclaimer: "2025 Tax Year Updates: Standard deductions increased - Single: $15,750, Married Joint: $31,500. Federal tax rates remain 10%, 12%, 22%, 24%, 32%, 35%, and 37% with adjusted income thresholds. For estimation purposes only - consult a tax professional for actual filing.",
      validation: {
        required: "This field is required",
        invalidSSN: "Please enter a valid SSN (XXX-XX-XXXX)",
        negativeAmount: "Amount cannot be negative",
        tooLarge: "Amount seems unreasonably large",
        invalidDependents: "Number of dependents must be between 0 and 20"
      },
      tabs: {
        personal: "Personal Info",
        income: "Income",
        payments: "Payments",
        deductions: "Deductions"
      },
      personalInfo: {
        title: "Personal Information",
        firstName: "First Name",
        lastName: "Last Name",
        ssn: "Social Security Number",
        filingStatus: "Filing Status",
        address: "Address",
        dependents: "Number of Dependents",
        marylandResident: "Maryland Resident",
        county: "Maryland County/City",
        filingStatuses: {
          single: "Single",
          marriedJointly: "Married Filing Jointly",
          marriedSeparately: "Married Filing Separately",
          headOfHousehold: "Head of Household"
        },
        placeholders: {
          firstName: "Enter first name",
          lastName: "Enter last name",
          ssn: "XXX-XX-XXXX",
          address: "Enter address"
        },
        help: {
          ssn: "Your 9-digit Social Security Number as shown on your Social Security card",
          dependents: "Children and other qualifying relatives you financially support",
          filingStatus: "Choose the status that applies to your situation on December 31, 2025"
        }
      },
      spouseInfo: {
        title: "Spouse Information",
        subtitle: "Enter your spouse's information for joint filing",
        firstName: "Spouse First Name",
        lastName: "Spouse Last Name",
        ssn: "Spouse SSN",
        income: "Spouse Income",
        wages: "Spouse Wages",
        withholding: "Spouse Tax Withholding",
        addSpouse: "Add Spouse Information",
        editSpouse: "Edit Spouse Information",
        removeSpouse: "Remove Spouse Information",
        filingComparison: "Filing Status Comparison",
        recommendedFiling: "Recommended Filing Status",
        jointSavings: "Joint Filing Saves",
        separateSavings: "Separate Filing Saves"
      },
      income: {
        title: "Income Information",
        wages: "Wages, Salaries, Tips (W-2)",
        interestIncome: "Interest Income (1099-INT)",
        dividends: "Dividend Income (1099-DIV)",
        capitalGains: "Capital Gains",
        businessIncome: "Business Income (Schedule C)",
        otherIncome: "Other Income",
        k1Income: "K-1 Partnership/S Corp Income",
        k1Section: {
          title: "K-1 Forms (Partnership/S Corporation)",
          ordinaryIncome: "Ordinary Business Income (Box 1)",
          netRentalRealEstate: "Net Rental Real Estate (Box 2)", 
          otherRentalIncome: "Other Rental Income (Box 3)",
          guaranteedPayments: "Guaranteed Payments (Box 4)",
          interestIncome: "Interest Income (Box 5)",
          dividends: "Ordinary Dividends (Box 6A)",
          royalties: "Royalties (Box 7)",
          netShortTermCapitalGain: "Net Short-term Capital Gain (Box 8A)",
          netLongTermCapitalGain: "Net Long-term Capital Gain (Box 9A)",
          otherPortfolioIncome: "Other Portfolio Income (Box 11)"
        },
        businessDetails: {
          title: "Detailed Business Income (Schedule C)",
          grossReceipts: "Gross Receipts or Sales",
          costOfGoodsSold: "Cost of Goods Sold",
          grossProfit: "Gross Profit",
          businessExpenses: "Total Business Expenses",
          netBusinessIncome: "Net Business Income"
        },
        help: {
          wages: "Enter the total from Box 1 of all your W-2 forms",
          interestIncome: "Interest from banks, bonds, and other sources",
          dividends: "Dividends from stocks and mutual funds",
          capitalGains: "Profit from sale of investments or property",
          k1Income: "Income from partnerships, S corporations, or limited liability companies"
        }
      },
      payments: {
        title: "Tax Payments & Withholdings",
        federalWithholding: "Federal Income Tax Withheld (Form W-2, Box 2)",
        stateWithholding: "Maryland State Tax Withheld (Form W-2, Box 17)",
        estimatedTaxPayments: "2025 Estimated Tax Payments",
        priorYearOverpayment: "Prior Year Overpayment Applied",
        otherPayments: "Other Payments & Credits",
        paymentSummary: "Payment Summary",
        totalPayments: "Total Payments:",
        federalTaxOwed: "Federal Tax Owed:",
        stateTaxOwed: "State Tax Owed:",
        localTaxOwed: "Local Tax Owed:",
        totalTaxOwed: "Total Tax Owed:",
        descriptions: {
          federalWithholding: "Enter amount from your W-2 form, box 2",
          stateWithholding: "Enter Maryland state tax withheld from your W-2 form, box 17",
          estimatedTaxPayments: "Quarterly estimated tax payments made for 2025",
          priorYearOverpayment: "Refund from 2024 applied to 2025 tax",
          otherPayments: "Additional payments, credits, or withholdings"
        }
      },
      deductions: {
        title: "Deductions",
        standardDeduction: "Standard Deduction:",
        itemizeDeductions: "Itemize Deductions",
        mortgageInterest: "Mortgage Interest",
        stateLocalTaxes: "State and Local Taxes (SALT) - Max $10,000",
        charitableContributions: "Charitable Contributions",
        medicalExpenses: "Medical Expenses (above 7.5% AGI)",
        otherItemized: "Other Itemized Deductions"
      },
      results: {
        title: "Tax Calculation (2025)",
        adjustedGrossIncome: "Adjusted Gross Income:",
        federalTaxableIncome: "Federal Taxable Income:",
        federalTax: "Federal Tax:",
        marylandTax: "Maryland State Tax:",
        localTax: "Local Tax",
        totalTax: "Total Tax Owed:",
        totalPayments: "Total Payments:",
        refundAmount: "💰 Refund Amount:",
        amountOwed: "💸 Amount You Owe:",
        effectiveRate: "Effective Tax Rate:",
        marginalRate: "Marginal Tax Rate:",
        afterTaxIncome: "After-Tax Income:"
      },
      actions: {
        title: "Actions",
        exportPDF: "Export Form 1040 PDF",
        exportJSON: "Export Tax Data (JSON)",
        recalculate: "Recalculate"
      },
      taxBrackets: {
        title: "2025 Federal Tax Brackets",
        taxableIncome: "Taxable Income",
        rate: "Rate"
      },
      marylandInfo: {
        title: "Maryland Tax Info",
        stateRateRange: "State Tax Rate Range:",
        localTaxRate: "Local Tax Rate",
        standardDeduction: "MD Standard Deduction:"
      },
      standardDeductions: {
        title: "2025 Standard Deduction",
        single: "Single:",
        marriedJointly: "Married Filing Jointly:",
        marriedSeparately: "Married Filing Separately:",
        headOfHousehold: "Head of Household:"
      }
    },
    zh: {
      title: "美国联邦税和马里兰州税计算器 2025",
      subtitle: "使用最新税率和扣除额计算您的2025年联邦税和马里兰州所得税",
      disclaimer: "2025税年更新：标准扣除额增加 - 单身：$15,750，已婚合并：$31,500。联邦税率保持10%、12%、22%、24%、32%、35%和37%，收入门槛已调整。仅供估算参考 - 实际报税请咨询专业税务顾问。",
      validation: {
        required: "此字段为必填项",
        invalidSSN: "请输入有效的社会安全号码 (XXX-XX-XXXX)",
        negativeAmount: "金额不能为负数",
        tooLarge: "金额似乎过大",
        invalidDependents: "受抚养人数量必须在0到20之间"
      },
      tabs: {
        personal: "个人信息",
        income: "收入信息",
        payments: "税款支付",
        deductions: "扣除项目"
      },
      personalInfo: {
        title: "个人信息",
        firstName: "名字",
        lastName: "姓氏",
        ssn: "社会安全号码",
        filingStatus: "报税身份",
        address: "地址",
        dependents: "受抚养人数量",
        marylandResident: "马里兰州居民",
        county: "马里兰郡/市",
        filingStatuses: {
          single: "单身",
          marriedJointly: "已婚合并申报",
          marriedSeparately: "已婚分别申报",
          headOfHousehold: "户主"
        },
        placeholders: {
          firstName: "输入名字",
          lastName: "输入姓氏",
          ssn: "XXX-XX-XXXX",
          address: "输入地址"
        },
        help: {
          ssn: "您的9位社会安全号码，如社会安全卡上所示",
          dependents: "您经济上支持的子女和其他符合条件的亲属",
          filingStatus: "选择适用于您2025年12月31日情况的身份"
        }
      },
      spouseInfo: {
        title: "配偶信息",
        subtitle: "输入您的配偶信息进行合并申报",
        firstName: "配偶名字",
        lastName: "配偶姓氏",
        ssn: "配偶社会安全号",
        income: "配偶收入",
        wages: "配偶工资",
        withholding: "配偶预扣税",
        addSpouse: "添加配偶信息",
        editSpouse: "编辑配偶信息",
        removeSpouse: "移除配偶信息",
        filingComparison: "报税方式比较",
        recommendedFiling: "推荐报税方式",
        jointSavings: "合并申报节省",
        separateSavings: "分别申报节省"
      },
      income: {
        title: "收入信息",
        wages: "工资、薪水、小费 (W-2)",
        interestIncome: "利息收入 (1099-INT)",
        dividends: "股息收入 (1099-DIV)",
        capitalGains: "资本利得",
        businessIncome: "营业收入 (Schedule C)",
        otherIncome: "其他收入",
        k1Income: "K-1合伙企业/S公司收入",
        k1Section: {
          title: "K-1表格（合伙企业/S公司）",
          ordinaryIncome: "普通营业收入（第1栏）",
          netRentalRealEstate: "净租赁房地产收入（第2栏）", 
          otherRentalIncome: "其他租赁收入（第3栏）",
          guaranteedPayments: "保证付款（第4栏）",
          interestIncome: "利息收入（第5栏）",
          dividends: "普通股息（第6A栏）",
          royalties: "版税（第7栏）",
          netShortTermCapitalGain: "净短期资本利得（第8A栏）",
          netLongTermCapitalGain: "净长期资本利得（第9A栏）",
          otherPortfolioIncome: "其他投资组合收入（第11栏）"
        },
        businessDetails: {
          title: "详细营业收入（Schedule C）",
          grossReceipts: "总收入或销售额",
          costOfGoodsSold: "销货成本",
          grossProfit: "毛利润",
          businessExpenses: "总营业费用",
          netBusinessIncome: "净营业收入"
        },
        help: {
          wages: "输入所有W-2表格第1栏的总额",
          interestIncome: "来自银行、债券和其他来源的利息",
          dividends: "来自股票和共同基金的股息",
          capitalGains: "出售投资或房产的利润",
          k1Income: "来自合伙企业、S公司或有限责任公司的收入"
        }
      },
      payments: {
        title: "税款支付和预扣",
        federalWithholding: "联邦所得税预扣 (W-2表格，第2栏)",
        stateWithholding: "马里兰州税预扣 (W-2表格，第17栏)",
        estimatedTaxPayments: "2025年预估税款支付",
        priorYearOverpayment: "上年度超额支付金额",
        otherPayments: "其他支付和抵税",
        paymentSummary: "支付汇总",
        totalPayments: "总支付额：",
        federalTaxOwed: "联邦税应缴：",
        stateTaxOwed: "州税应缴：",
        localTaxOwed: "地方税应缴：",
        totalTaxOwed: "总税额应缴：",
        descriptions: {
          federalWithholding: "输入W-2表格第2栏的金额",
          stateWithholding: "输入W-2表格第17栏马里兰州税预扣金额",
          estimatedTaxPayments: "2025年季度预估税款支付",
          priorYearOverpayment: "2024年退税用于2025年税款",
          otherPayments: "额外支付、抵税或预扣"
        }
      },
      deductions: {
        title: "扣除项目",
        standardDeduction: "标准扣除：",
        itemizeDeductions: "详细列举扣除",
        mortgageInterest: "房贷利息",
        stateLocalTaxes: "州和地方税 (SALT) - 最高$10,000",
        charitableContributions: "慈善捐款",
        medicalExpenses: "医疗费用 (超过AGI的7.5%)",
        otherItemized: "其他详细列举扣除"
      },
      results: {
        title: "税务计算 (2025)",
        adjustedGrossIncome: "调整后总收入：",
        federalTaxableIncome: "联邦应税收入：",
        federalTax: "联邦税：",
        marylandTax: "马里兰州税：",
        localTax: "地方税",
        totalTax: "总应缴税额：",
        totalPayments: "总支付额：",
        refundAmount: "💰 退税金额：",
        amountOwed: "💸 应补缴金额：",
        effectiveRate: "有效税率：",
        marginalRate: "边际税率：",
        afterTaxIncome: "税后收入："
      },
      actions: {
        title: "操作",
        exportPDF: "导出1040表格PDF",
        exportJSON: "导出税务数据 (JSON)",
        recalculate: "重新计算"
      },
      taxBrackets: {
        title: "2025联邦税级",
        taxableIncome: "应税收入",
        rate: "税率"
      },
      marylandInfo: {
        title: "马里兰税务信息",
        stateRateRange: "州税税率范围：",
        localTaxRate: "地方税率",
        standardDeduction: "马里兰标准扣除："
      },
      standardDeductions: {
        title: "2025标准扣除",
        single: "单身：",
        marriedJointly: "已婚合并：",
        marriedSeparately: "已婚分别：",
        headOfHousehold: "户主："
      }
    },
    es: {
      title: "Calculadora de Impuestos Federales y de Maryland 2025",
      subtitle: "Calcule sus impuestos federales y estatales de Maryland para 2025 con tasas y deducciones actualizadas",
      disclaimer: "Actualizaciones del Año Fiscal 2025: Deducciones estándar aumentadas - Soltero: $15,750, Casado Conjunto: $31,500. Las tasas de impuestos federales permanecen en 10%, 12%, 22%, 24%, 32%, 35% y 37% con umbrales de ingresos ajustados. Solo para fines de estimación - consulte a un profesional de impuestos para la presentación real.",
      validation: {
        required: "Este campo es obligatorio",
        invalidSSN: "Por favor ingrese un SSN válido (XXX-XX-XXXX)",
        negativeAmount: "La cantidad no puede ser negativa",
        tooLarge: "La cantidad parece demasiado grande",
        invalidDependents: "El número de dependientes debe estar entre 0 y 20"
      },
      tabs: {
        personal: "Info Personal",
        income: "Ingresos",
        payments: "Pagos",
        deductions: "Deducciones"
      },
      personalInfo: {
        title: "Información Personal",
        firstName: "Nombre",
        lastName: "Apellido",
        ssn: "Número de Seguro Social",
        filingStatus: "Estado Civil",
        address: "Dirección",
        dependents: "Número de Dependientes",
        marylandResident: "Residente de Maryland",
        county: "Condado/Ciudad de Maryland",
        filingStatuses: {
          single: "Soltero",
          marriedJointly: "Casado Presentando Conjuntamente",
          marriedSeparately: "Casado Presentando Por Separado",
          headOfHousehold: "Cabeza de Familia"
        },
        placeholders: {
          firstName: "Ingrese el nombre",
          lastName: "Ingrese el apellido",
          ssn: "XXX-XX-XXXX",
          address: "Ingrese la dirección"
        },
        help: {
          ssn: "Su Número de Seguro Social de 9 dígitos como aparece en su tarjeta",
          dependents: "Hijos y otros parientes calificados que usted mantiene financieramente",
          filingStatus: "Elija el estado que se aplica a su situación el 31 de diciembre de 2025"
        }
      },
      spouseInfo: {
        title: "Información del Cónyuge",
        subtitle: "Ingrese la información de su cónyuge para presentación conjunta",
        firstName: "Nombre del Cónyuge",
        lastName: "Apellido del Cónyuge",
        ssn: "SSN del Cónyuge",
        income: "Ingresos del Cónyuge",
        wages: "Salario del Cónyuge",
        withholding: "Retención de Impuestos del Cónyuge",
        addSpouse: "Agregar Información del Cónyuge",
        editSpouse: "Editar Información del Cónyuge",
        removeSpouse: "Eliminar Información del Cónyuge",
        filingComparison: "Comparación de Estado de Presentación",
        recommendedFiling: "Estado de Presentación Recomendado",
        jointSavings: "Presentación Conjunta Ahorra",
        separateSavings: "Presentación Separada Ahorra"
      },
      income: {
        title: "Información de Ingresos",
        wages: "Salarios, Sueldos, Propinas (W-2)",
        interestIncome: "Ingresos por Intereses (1099-INT)",
        dividends: "Ingresos por Dividendos (1099-DIV)",
        capitalGains: "Ganancias de Capital",
        businessIncome: "Ingresos de Negocio (Anexo C)",
        otherIncome: "Otros Ingresos",
        k1Income: "Ingresos K-1 Sociedad/Corporación S",
        k1Section: {
          title: "Formularios K-1 (Sociedad/Corporación S)",
          ordinaryIncome: "Ingresos Comerciales Ordinarios (Casilla 1)",
          netRentalRealEstate: "Bienes Raíces de Alquiler Neto (Casilla 2)", 
          otherRentalIncome: "Otros Ingresos de Alquiler (Casilla 3)",
          guaranteedPayments: "Pagos Garantizados (Casilla 4)",
          interestIncome: "Ingresos por Intereses (Casilla 5)",
          dividends: "Dividendos Ordinarios (Casilla 6A)",
          royalties: "Regalías (Casilla 7)",
          netShortTermCapitalGain: "Ganancia de Capital a Corto Plazo Neta (Casilla 8A)",
          netLongTermCapitalGain: "Ganancia de Capital a Largo Plazo Neta (Casilla 9A)",
          otherPortfolioIncome: "Otros Ingresos de Cartera (Casilla 11)"
        },
        businessDetails: {
          title: "Ingresos de Negocio Detallados (Anexo C)",
          grossReceipts: "Recibos Brutos o Ventas",
          costOfGoodsSold: "Costo de Bienes Vendidos",
          grossProfit: "Ganancia Bruta",
          businessExpenses: "Gastos Comerciales Totales",
          netBusinessIncome: "Ingresos Netos del Negocio"
        },
        help: {
          wages: "Ingrese el total de la Casilla 1 de todos sus formularios W-2",
          interestIncome: "Intereses de bancos, bonos y otras fuentes",
          dividends: "Dividendos de acciones y fondos mutuos",
          capitalGains: "Ganancia de la venta de inversiones o propiedades",
          k1Income: "Ingresos de sociedades, corporaciones S o compañías de responsabilidad limitada"
        }
      },
      payments: {
        title: "Pagos de Impuestos y Retenciones",
        federalWithholding: "Impuesto Federal Retenido (Formulario W-2, Casilla 2)",
        stateWithholding: "Impuesto Estatal de Maryland Retenido (Formulario W-2, Casilla 17)",
        estimatedTaxPayments: "Pagos de Impuestos Estimados 2025",
        priorYearOverpayment: "Sobrepago del Año Anterior Aplicado",
        otherPayments: "Otros Pagos y Créditos",
        paymentSummary: "Resumen de Pagos",
        totalPayments: "Pagos Totales:",
        federalTaxOwed: "Impuesto Federal Adeudado:",
        stateTaxOwed: "Impuesto Estatal Adeudado:",
        localTaxOwed: "Impuesto Local Adeudado:",
        totalTaxOwed: "Total de Impuestos Adeudados:",
        descriptions: {
          federalWithholding: "Ingrese la cantidad del formulario W-2, casilla 2",
          stateWithholding: "Ingrese el impuesto estatal de Maryland retenido del formulario W-2, casilla 17",
          estimatedTaxPayments: "Pagos trimestrales de impuestos estimados realizados para 2025",
          priorYearOverpayment: "Reembolso de 2024 aplicado al impuesto de 2025",
          otherPayments: "Pagos adicionales, créditos o retenciones"
        }
      },
      deductions: {
        title: "Deducciones",
        standardDeduction: "Deducción Estándar:",
        itemizeDeductions: "Deducciones Detalladas",
        mortgageInterest: "Intereses Hipotecarios",
        stateLocalTaxes: "Impuestos Estatales y Locales (SALT) - Máx $10,000",
        charitableContributions: "Contribuciones Caritativas",
        medicalExpenses: "Gastos Médicos (arriba del 7.5% AGI)",
        otherItemized: "Otras Deducciones Detalladas"
      },
      results: {
        title: "Cálculo de Impuestos (2025)",
        adjustedGrossIncome: "Ingreso Bruto Ajustado:",
        federalTaxableIncome: "Ingreso Gravable Federal:",
        federalTax: "Impuesto Federal:",
        marylandTax: "Impuesto Estatal de Maryland:",
        localTax: "Impuesto Local",
        totalTax: "Total de Impuestos Adeudados:",
        totalPayments: "Pagos Totales:",
        refundAmount: "💰 Cantidad de Reembolso:",
        amountOwed: "💸 Cantidad Adeudada:",
        effectiveRate: "Tasa de Impuesto Efectiva:",
        marginalRate: "Tasa de Impuesto Marginal:",
        afterTaxIncome: "Ingreso Después de Impuestos:"
      },
      actions: {
        title: "Acciones",
        exportPDF: "Exportar Formulario 1040 PDF",
        exportJSON: "Exportar Datos de Impuestos (JSON)",
        recalculate: "Recalcular"
      },
      taxBrackets: {
        title: "Tramos de Impuestos Federales 2025",
        taxableIncome: "Ingreso Gravable",
        rate: "Tasa"
      },
      marylandInfo: {
        title: "Información de Impuestos de Maryland",
        stateRateRange: "Rango de Tasa Estatal:",
        localTaxRate: "Tasa de Impuesto Local",
        standardDeduction: "Deducción Estándar MD:"
      },
      standardDeductions: {
        title: "Deducción Estándar 2025",
        single: "Soltero:",
        marriedJointly: "Casado Presentando Conjuntamente:",
        marriedSeparately: "Casado Presentando Por Separado:",
        headOfHousehold: "Cabeza de Familia:"
      }
    }
  };

  // Get translation text
  const t = (path) => {
    const keys = path.split('.');
    let result = translations[language];
    for (const key of keys) {
      result = result && result[key];
    }
    return result || path;
  };

  // Validation functions
  const validateSSN = (ssn) => {
    const pattern = /^\d{3}-\d{2}-\d{4}$/;
    return pattern.test(ssn);
  };

  const validateAmount = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return false;
    if (num < 0) return 'negativeAmount';
    if (num > 50000000) return 'tooLarge';
    return true;
  };

  const validateRequired = (value) => {
    return value && value.toString().trim().length > 0;
  };

  const validateDependents = (dependents) => {
    const num = Number(dependents);
    return !isNaN(num) && num >= 0 && num <= 20;
  };

  const validateField = (field, value, section) => {
    let error = null;

    switch (section) {
      case 'personal':
        if (field === 'firstName' || field === 'lastName') {
          if (!validateRequired(value)) error = t('validation.required');
        }
        if (field === 'ssn') {
          if (!validateRequired(value)) error = t('validation.required');
          else if (!validateSSN(value)) error = t('validation.invalidSSN');
        }
        if (field === 'dependents') {
          if (!validateDependents(value)) error = t('validation.invalidDependents');
        }
        break;
      
      case 'income':
      case 'payments':
      case 'deductions':
        if (field !== 'useStandardDeduction') {
          const validation = validateAmount(value);
          if (validation === 'negativeAmount') error = t('validation.negativeAmount');
          else if (validation === 'tooLarge') error = t('validation.tooLarge');
        }
        break;
    }

    return error;
  };

  const updateErrors = (field, error, section) => {
    setErrors(prev => ({
      ...prev,
      [`${section}.${field}`]: error
    }));
  };

  const markTouched = (field, section) => {
    setTouched(prev => ({
      ...prev,
      [`${section}.${field}`]: true
    }));
  };

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setShowLanguageMenu(false);
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === language) || languages[0];
  };

  // Tax data
  const federalTaxBrackets = {
    single: [
      { min: 0, max: 11925, rate: 0.10 },
      { min: 11925, max: 48475, rate: 0.12 },
      { min: 48475, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250525, rate: 0.32 },
      { min: 250525, max: 626350, rate: 0.35 },
      { min: 626350, max: Infinity, rate: 0.37 }
    ],
    marriedJointly: [
      { min: 0, max: 23850, rate: 0.10 },
      { min: 23850, max: 96950, rate: 0.12 },
      { min: 96950, max: 206700, rate: 0.22 },
      { min: 206700, max: 394600, rate: 0.24 },
      { min: 394600, max: 501050, rate: 0.32 },
      { min: 501050, max: 751600, rate: 0.35 },
      { min: 751600, max: Infinity, rate: 0.37 }
    ],
    marriedSeparately: [
      { min: 0, max: 11925, rate: 0.10 },
      { min: 11925, max: 48475, rate: 0.12 },
      { min: 48475, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250525, rate: 0.32 },
      { min: 250525, max: 375800, rate: 0.35 },
      { min: 375800, max: Infinity, rate: 0.37 }
    ],
    headOfHousehold: [
      { min: 0, max: 17000, rate: 0.10 },
      { min: 17000, max: 64850, rate: 0.12 },
      { min: 64850, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250500, rate: 0.32 },
      { min: 250500, max: 626350, rate: 0.35 },
      { min: 626350, max: Infinity, rate: 0.37 }
    ]
  };

  const standardDeductions = {
    single: 15750,
    marriedJointly: 31500,
    marriedSeparately: 15750,
    headOfHousehold: 23625
  };

  const marylandTaxBrackets = [
    { min: 0, max: 1000, rate: 0.02 },
    { min: 1000, max: 2000, rate: 0.03 },
    { min: 2000, max: 3000, rate: 0.04 },
    { min: 3000, max: 100000, rate: 0.0475 },
    { min: 100000, max: 125000, rate: 0.05 },
    { min: 125000, max: 150000, rate: 0.0525 },
    { min: 150000, max: 250000, rate: 0.055 },
    { min: 250000, max: Infinity, rate: 0.0575 }
  ];

  const marylandCountyRates = {
    'Allegany': 0.0305,
    'Anne Arundel': 0.0281,
    'Baltimore City': 0.032,
    'Baltimore County': 0.032,
    'Calvert': 0.032,
    'Caroline': 0.0263,
    'Carroll': 0.032,
    'Cecil': 0.0274,
    'Charles': 0.029,
    'Dorchester': 0.0262,
    'Frederick': 0.0296,
    'Garrett': 0.0265,
    'Harford': 0.0306,
    'Howard': 0.032,
    'Kent': 0.0285,
    'Montgomery': 0.032,
    'Prince Georges': 0.032,
    'Queen Annes': 0.0285,
    'Somerset': 0.032,
    'St. Marys': 0.032,
    'Talbot': 0.0240,
    'Washington': 0.028,
    'Wicomico': 0.032,
    'Worcester': 0.0125
  };

  // Filing comparison function
  const calculateFilingComparison = () => {
    if (personalInfo.filingStatus !== 'marriedJointly') return null;

    const taxpayerIncome = Object.values(incomeData).reduce((sum, value) => sum + Number(value), 0);
    const spouseIncome = Object.values(spouseInfo).slice(3, 9).reduce((sum, value) => sum + Number(value), 0);
    const totalIncome = taxpayerIncome + spouseIncome;

    const taxpayerPayments = Object.values(paymentsData).reduce((sum, value) => sum + Number(value), 0);
    const spousePayments = spouseInfo.federalWithholding + spouseInfo.stateWithholding;
    const totalPayments = taxpayerPayments + spousePayments;

    // Calculate joint filing
    const jointStandardDeduction = standardDeductions.marriedJointly;
    const jointTaxableIncome = Math.max(0, totalIncome - jointStandardDeduction);
    
    let jointFederalTax = 0;
    const jointBrackets = federalTaxBrackets.marriedJointly;
    for (let i = 0; i < jointBrackets.length; i++) {
      const bracket = jointBrackets[i];
      if (jointTaxableIncome > bracket.min) {
        const taxableInBracket = Math.min(jointTaxableIncome - bracket.min, bracket.max - bracket.min);
        jointFederalTax += taxableInBracket * bracket.rate;
      }
    }

    // Calculate separate filing for taxpayer
    const separateStandardDeduction = standardDeductions.marriedSeparately;
    const taxpayerTaxableIncome = Math.max(0, taxpayerIncome - separateStandardDeduction);
    const spouseTaxableIncome = Math.max(0, spouseIncome - separateStandardDeduction);
    
    let taxpayerSeparateFederalTax = 0;
    let spouseSeparateFederalTax = 0;
    const separateBrackets = federalTaxBrackets.marriedSeparately;
    
    // Taxpayer tax
    for (let i = 0; i < separateBrackets.length; i++) {
      const bracket = separateBrackets[i];
      if (taxpayerTaxableIncome > bracket.min) {
        const taxableInBracket = Math.min(taxpayerTaxableIncome - bracket.min, bracket.max - bracket.min);
        taxpayerSeparateFederalTax += taxableInBracket * bracket.rate;
      }
    }
    
    // Spouse tax
    for (let i = 0; i < separateBrackets.length; i++) {
      const bracket = separateBrackets[i];
      if (spouseTaxableIncome > bracket.min) {
        const taxableInBracket = Math.min(spouseTaxableIncome - bracket.min, bracket.max - bracket.min);
        spouseSeparateFederalTax += taxableInBracket * bracket.rate;
      }
    }

    const totalSeparateFederalTax = taxpayerSeparateFederalTax + spouseSeparateFederalTax;

    const jointRefund = Math.max(0, totalPayments - jointFederalTax);
    const jointOwed = Math.max(0, jointFederalTax - totalPayments);
    const separateRefund = Math.max(0, totalPayments - totalSeparateFederalTax);
    const separateOwed = Math.max(0, totalSeparateFederalTax - totalPayments);

    const jointAdvantage = (totalSeparateFederalTax - jointFederalTax);
    const separateAdvantage = (jointFederalTax - totalSeparateFederalTax);

    return {
      joint: {
        totalIncome,
        taxableIncome: jointTaxableIncome,
        federalTax: jointFederalTax,
        refund: jointRefund,
        owed: jointOwed
      },
      separate: {
        taxpayer: {
          income: taxpayerIncome,
          taxableIncome: taxpayerTaxableIncome,
          federalTax: taxpayerSeparateFederalTax
        },
        spouse: {
          income: spouseIncome,
          taxableIncome: spouseTaxableIncome,
          federalTax: spouseSeparateFederalTax
        },
        totalFederalTax: totalSeparateFederalTax,
        refund: separateRefund,
        owed: separateOwed
      },
      recommendation: jointAdvantage > 0 ? 'joint' : 'separate',
      savings: Math.abs(jointAdvantage)
    };
  };

  // Calculate taxes function
  const calculateTax = () => {
    let totalIncome = Object.values(incomeData).reduce((sum, value) => sum + Number(value), 0);
    
    // Add K-1 income
    const k1Income = Object.values(k1Data).reduce((sum, value) => sum + Number(value), 0);
    totalIncome += k1Income;
    
    // Add detailed business income (net business income from Schedule C)
    const netBusinessIncome = (Number(businessDetails.grossReceipts) || 0) - 
                            (Number(businessDetails.costOfGoodsSold) || 0) - 
                            (Number(businessDetails.businessExpenses) || 0);
    totalIncome += Math.max(0, netBusinessIncome); // Only add if positive
    
    // Add spouse income if filing jointly
    if (personalInfo.filingStatus === 'marriedJointly') {
      const spouseIncome = Object.values(spouseInfo).slice(3, 9).reduce((sum, value) => sum + Number(value), 0);
      totalIncome += spouseIncome;
    }
    
    const adjustedGrossIncome = totalIncome;
    
    const standardDed = standardDeductions[personalInfo.filingStatus];
    const itemizedTotal = Object.values(deductions).slice(2).reduce((sum, value) => sum + Number(value), 0);
    const actualDeduction = deductions.useStandardDeduction ? standardDed : Math.max(itemizedTotal, standardDed);
    
    const federalTaxableIncome = Math.max(0, adjustedGrossIncome - actualDeduction);
    
    const federalBrackets = federalTaxBrackets[personalInfo.filingStatus];
    let federalTax = 0;
    let marginalRate = 0;
    
    for (let i = 0; i < federalBrackets.length; i++) {
      const bracket = federalBrackets[i];
      if (federalTaxableIncome > bracket.min) {
        const taxableInBracket = Math.min(federalTaxableIncome - bracket.min, bracket.max - bracket.min);
        federalTax += taxableInBracket * bracket.rate;
        marginalRate = bracket.rate;
      }
    }
    
    let marylandTax = 0;
    let localTax = 0;
    
    if (personalInfo.isMaryland) {
      const mdStandardDeduction = personalInfo.filingStatus === 'marriedJointly' ? 4850 : 2400;
      const marylandTaxableIncome = Math.max(0, adjustedGrossIncome - mdStandardDeduction);
      
      for (let i = 0; i < marylandTaxBrackets.length; i++) {
        const bracket = marylandTaxBrackets[i];
        if (marylandTaxableIncome > bracket.min) {
          const taxableInBracket = Math.min(marylandTaxableIncome - bracket.min, bracket.max - bracket.min);
          marylandTax += taxableInBracket * bracket.rate;
        }
      }
      
      const localRate = marylandCountyRates[personalInfo.county] || 0.032;
      localTax = marylandTaxableIncome * localRate;
    }
    
    const totalTax = federalTax + marylandTax + localTax;
    
    let totalPayments = Object.values(paymentsData).reduce((sum, value) => sum + Number(value), 0);
    
    // Add spouse payments if filing jointly
    if (personalInfo.filingStatus === 'marriedJointly') {
      totalPayments += spouseInfo.federalWithholding + spouseInfo.stateWithholding;
    }
    
    const refundAmount = Math.max(0, totalPayments - totalTax);
    const amountOwed = Math.max(0, totalTax - totalPayments);
    const effectiveRate = adjustedGrossIncome > 0 ? totalTax / adjustedGrossIncome : 0;
    const afterTaxIncome = adjustedGrossIncome - totalTax;

    setTaxResult({
      adjustedGrossIncome,
      taxableIncome: federalTaxableIncome,
      federalTax,
      marylandTax,
      localTax,
      totalTax,
      totalPayments,
      refundAmount,
      amountOwed,
      effectiveRate,
      marginalRate,
      afterTaxIncome
    });

    // Calculate filing comparison if married
    if (personalInfo.filingStatus === 'marriedJointly') {
      const comparison = calculateFilingComparison();
      setFilingComparison(comparison);
    }
  };

// 自动同步标准扣除额
useEffect(() => {
  setDeductions(prev => ({
    ...prev,
    standardDeduction: standardDeductions[personalInfo.filingStatus]
  }));
}, [personalInfo.filingStatus]);

// 只用来计算税务 - 已移除自动计算，改为手动点击按钮计算
// useEffect(() => {
//   calculateTax();
//   
//   // Calculate filing comparison if married
//   if (personalInfo.filingStatus === 'marriedJointly') {
//     const comparison = calculateFilingComparison();
//     setFilingComparison(comparison);
//   }
// }, [personalInfo, incomeData, deductions, paymentsData, spouseInfo]);


  const handlePersonalInfoChange = (field, value) => {
    // 跳过姓名和SSN的实时验证，避免干扰输入
    if (field !== 'firstName' && field !== 'lastName' && field !== 'ssn') {
      const error = validateField(field, value, 'personal');
      updateErrors(field, error, 'personal');
    }
    setPersonalInfo(prev => {
      const newInfo = { ...prev, [field]: value };
      
      // Show spouse dialog when married filing jointly is selected
      if (field === 'filingStatus') {
        if (value === 'marriedJointly' && !showSpouseDialog) {
          setShowSpouseDialog(true);
        } else if (value !== 'marriedJointly') {
          setShowSpouseDialog(false);
          setFilingComparison(null);
        }
      }
      
      return newInfo;
    });
  };

  const handleSpouseInfoChange = (field, value) => {
    // 跳过姓名和SSN的实时验证，避免干扰输入
    if (field !== 'firstName' && field !== 'lastName' && field !== 'ssn') {
      const error = validateField(field, value, 'spouse');
      updateErrors(field, error, 'spouse');
    }
    setSpouseInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleIncomeChange = (field, value) => {
    // 存储原始字符串值，避免立即数字转换导致重新渲染
    setIncomeData(prev => ({ ...prev, [field]: value }));
  };

  const handleDeductionChange = (field, value) => {
    if (field === 'useStandardDeduction') {
      setDeductions(prev => ({ ...prev, [field]: value }));
    } else {
      // 存储原始字符串值，避免立即数字转换导致重新渲染
      setDeductions(prev => ({ ...prev, [field]: value }));
    }
  };

  const handlePaymentsChange = (field, value) => {
    // 存储原始字符串值，避免立即数字转换导致重新渲染
    setPaymentsData(prev => ({ ...prev, [field]: value }));
  };

  const handleK1Change = (field, value) => {
    // 存储K-1数据，避免立即数字转换导致重新渲染
    setK1Data(prev => ({ ...prev, [field]: value }));
  };

  const handleBusinessDetailsChange = (field, value) => {
    // 存储详细业务收入数据
    setBusinessDetails(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount) => {
    const locale = language === 'zh' ? 'zh-CN' : language === 'es' ? 'es-US' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (rate) => {
    return (rate * 100).toFixed(1) + '%';
  };

  const exportTaxReturn = () => {
    const taxReturn = {
      personalInfo,
      incomeData,
      deductions,
      taxResult,
      taxYear: '2025',
      date: new Date().toLocaleDateString(language === 'zh' ? 'zh-CN' : language === 'es' ? 'es-ES' : 'en-US'),
      language
    };
    
    const dataStr = JSON.stringify(taxReturn, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `Tax_Return_${personalInfo.lastName}_${personalInfo.firstName}_2025.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportToPDF = () => {
    const message = language === 'zh' ? 
      '此功能将打开一个新窗口用于打印表格。请注意，由于浏览器限制，某些功能可能需要在实际服务器环境中运行。' :
      language === 'es' ?
      'Esta función abrirá una nueva ventana para imprimir el formulario. Tenga en cuenta que algunas características pueden requerir ejecutarse en un entorno de servidor real debido a las restricciones del navegador.' :
      'This function will open a new window for printing the form. Please note that some features may require running in an actual server environment due to browser restrictions.';
    alert(message);
  };

  const formatSSN = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,2})(\d{0,4})$/);
    if (match) {
      let formatted = match[1];
      if (match[2]) formatted += '-' + match[2];
      if (match[3]) formatted += '-' + match[3];
      return formatted;
    }
    return value;
  };

  // 非受控输入组件，完全避免重新渲染问题
  const UncontrolledInput = ({ field, defaultValue, onChange, type = "text", placeholder, max, min, step }) => {
    const inputRef = React.useRef(null);
    
    React.useEffect(() => {
      if (inputRef.current && defaultValue !== undefined) {
        inputRef.current.value = defaultValue || "";
      }
    }, [defaultValue]);

    return (
      <input
        ref={inputRef}
        type={type}
        defaultValue={defaultValue || ""}
        onChange={(e) => {
          // 不立即更新状态，避免重新渲染
        }}
        onBlur={(e) => {
          // 只在失去焦点时更新状态
          let newValue = e.target.value;
          if (field === 'ssn') {
            newValue = formatSSN(newValue);
          }
          onChange(field, newValue);
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm sm:text-base"
        placeholder={placeholder}
        max={max}
        min={min}
        step={step}
      />
    );
  };

  const ValidatedInput = ({ field, value, onChange, section, type = "text", placeholder, help, required = false, max, min, step }) => {
    const errorKey = `${section}.${field}`;
    const hasError = errors[errorKey];
    const isTouched = touched[errorKey];
    
    return (
      <div className="space-y-1">
        <div className="relative">
          <input
            type={type}
            value={value || ""}
            onChange={(e) => {
              let newValue = e.target.value;
              if (field === 'ssn') {
                newValue = formatSSN(newValue);
              }
              onChange(field, newValue);
            }}
            onBlur={() => markTouched(field, section)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors text-sm sm:text-base ${
              hasError && isTouched
                ? 'border-red-500 focus:ring-red-500 bg-red-50'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder={placeholder}
            max={max}
            min={min}
            step={step}
          />
          {hasError && isTouched && (
            <div className="absolute right-2 top-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
          {!hasError && isTouched && required && (
            <div className="absolute right-2 top-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          )}
        </div>
        
        {hasError && isTouched && (
          <div className="flex items-center gap-1 text-red-600 text-xs sm:text-sm">
            <AlertCircle className="h-3 w-3" />
            <span>{hasError}</span>
          </div>
        )}
        
        {help && !hasError && (
          <div className="text-gray-500 text-xs">
            💡 {help}
          </div>
        )}
      </div>
    );
  };

  const TaxBurdenChart = () => {
    const chartData = [
      {
        name: language === 'zh' ? '联邦税' : language === 'es' ? 'Impuesto Federal' : 'Federal Tax',
        value: taxResult.federalTax,
        color: '#2563eb'
      },
      {
        name: language === 'zh' ? '州税' : language === 'es' ? 'Impuesto Estatal' : 'State Tax',
        value: taxResult.marylandTax,
        color: '#dc2626'
      },
      {
        name: language === 'zh' ? '地方税' : language === 'es' ? 'Impuesto Local' : 'Local Tax',
        value: taxResult.localTax,
        color: '#059669'
      },
      {
        name: language === 'zh' ? '税后收入' : language === 'es' ? 'Ingresos Después de Impuestos' : 'After-Tax Income',
        value: taxResult.afterTaxIncome,
        color: '#10b981'
      }
    ].filter(item => item.value > 0);

    const CustomTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
        const data = payload[0];
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
            <p className="font-medium text-gray-900">{data.name}</p>
            <p className="text-lg font-bold" style={{ color: data.payload.color }}>
              {formatCurrency(data.value)}
            </p>
            <p className="text-sm text-gray-600">
              {((data.value / taxResult.adjustedGrossIncome) * 100).toFixed(1)}%
            </p>
          </div>
        );
      }
      return null;
    };

    return (
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          {language === 'zh' ? '税负分布' : language === 'es' ? 'Distribución de Impuestos' : 'Tax Burden Distribution'}
        </h3>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color, fontSize: '12px' }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-gray-600">{item.name}</span>
              </div>
              <span className="font-semibold">{formatCurrency(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const FilingComparisonCard = () => {
    if (!filingComparison) return null;

    return (
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-green-600" />
          {t('spouseInfo.filingComparison')}
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border-2 ${
              filingComparison.recommendation === 'joint' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="text-sm font-medium text-gray-700 mb-2">
                {t('personalInfo.filingStatuses.marriedJointly')}
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(filingComparison.joint.federalTax)}
              </div>
              <div className="text-xs text-gray-600">
                {language === 'zh' ? '联邦税' : language === 'es' ? 'Impuesto Federal' : 'Federal Tax'}
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              filingComparison.recommendation === 'separate' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="text-sm font-medium text-gray-700 mb-2">
                {t('personalInfo.filingStatuses.marriedSeparately')}
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(filingComparison.separate.totalFederalTax)}
              </div>
              <div className="text-xs text-gray-600">
                {language === 'zh' ? '联邦税总计' : language === 'es' ? 'Impuesto Federal Total' : 'Total Federal Tax'}
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">{t('spouseInfo.recommendedFiling')}</span>
            </div>
            <div className="text-lg font-bold text-yellow-900">
              {filingComparison.recommendation === 'joint' 
                ? t('personalInfo.filingStatuses.marriedJointly')
                : t('personalInfo.filingStatuses.marriedSeparately')
              }
            </div>
            <div className="text-sm text-yellow-700 mt-1">
              {filingComparison.recommendation === 'joint' 
                ? t('spouseInfo.jointSavings') 
                : t('spouseInfo.separateSavings')
              }: {formatCurrency(filingComparison.savings)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SpouseDialog = () => {
    if (!showSpouseDialog) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">{t('spouseInfo.title')}</h3>
              </div>
              <button
                onClick={() => setShowSpouseDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">{t('spouseInfo.subtitle')}</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('spouseInfo.firstName')}
                  </label>
                  <UncontrolledInput
                    field="firstName"
                    defaultValue={spouseInfo.firstName}
                    onChange={handleSpouseInfoChange}
                    placeholder={t('personalInfo.placeholders.firstName')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('spouseInfo.lastName')}
                  </label>
                  <UncontrolledInput
                    field="lastName"
                    defaultValue={spouseInfo.lastName}
                    onChange={handleSpouseInfoChange}
                    placeholder={t('personalInfo.placeholders.lastName')}
                  />
                </div>
                
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('spouseInfo.ssn')}
                  </label>
                  <UncontrolledInput
                    field="ssn"
                    defaultValue={spouseInfo.ssn}
                    onChange={handleSpouseInfoChange}
                    placeholder={t('personalInfo.placeholders.ssn')}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-4">{t('spouseInfo.income')}</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('income.wages')}
                    </label>
                    <ValidatedInput
                      field="wages"
                      value={spouseInfo.wages}
                      onChange={handleSpouseInfoChange}
                      section="spouse"
                      type="number"
                      placeholder="0"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('income.interestIncome')}
                    </label>
                    <ValidatedInput
                      field="interestIncome"
                      value={spouseInfo.interestIncome}
                      onChange={handleSpouseInfoChange}
                      section="spouse"
                      type="number"
                      placeholder="0"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-4">{t('spouseInfo.withholding')}</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('payments.federalWithholding')}
                    </label>
                    <ValidatedInput
                      field="federalWithholding"
                      value={spouseInfo.federalWithholding}
                      onChange={handleSpouseInfoChange}
                      section="spouse"
                      type="number"
                      placeholder="0"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  
                  {personalInfo.isMaryland && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('payments.stateWithholding')}
                      </label>
                      <ValidatedInput
                        field="stateWithholding"
                        value={spouseInfo.stateWithholding}
                        onChange={handleSpouseInfoChange}
                        section="spouse"
                        type="number"
                        placeholder="0"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowSpouseDialog(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {language === 'zh' ? '取消' : language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={() => setShowSpouseDialog(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {language === 'zh' ? '保存' : language === 'es' ? 'Guardar' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLanguageMenu && !event.target.closest('.language-selector')) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
    }, [showLanguageMenu]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-red-50 to-yellow-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 sm:gap-2">
                <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <div className="w-4 h-4 sm:w-6 sm:h-6 bg-red-500 rounded"></div>
                <div className="w-4 h-4 sm:w-6 sm:h-6 bg-white border border-gray-300 rounded"></div>
                <div className="w-4 h-4 sm:w-6 sm:h-6 bg-blue-500 rounded"></div>
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{t('title')}</h1>
            </div>
            
            {/* Language Toggle */}
            <div className="relative language-selector">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                <Globe className="h-4 w-4" />
                <span className="text-base sm:text-lg">{getCurrentLanguage().flag}</span>
                <span className="hidden sm:inline">{getCurrentLanguage().name}</span>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-3 py-2 sm:px-4 text-sm hover:bg-gray-100 flex items-center gap-2 ${
                        language === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-base sm:text-lg">{lang.flag}</span>
                      <span className="text-sm sm:text-base">{lang.name}</span>
                      {language === lang.code && (
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <p className="text-gray-600 text-sm sm:text-base mt-2">{t('subtitle')}</p>
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-yellow-800">
                <strong>{language === 'en' ? '2025 Tax Year Updates:' : language === 'zh' ? '2025税年更新：' : 'Actualizaciones del Año Fiscal 2025:'}</strong> {t('disclaimer')}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Panel - Input Forms */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg shadow-lg">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 overflow-x-auto">
                <nav className="flex min-w-max">
                  {['personal', 'income', 'payments', 'deductions'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-3 sm:px-6 font-medium text-xs sm:text-sm whitespace-nowrap ${
                        activeTab === tab
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        {tab === 'personal' && <User className="h-3 w-3 sm:h-4 sm:w-4" />}
                        {tab === 'income' && <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />}
                        {tab === 'payments' && <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />}
                        {tab === 'deductions' && <FileText className="h-3 w-3 sm:h-4 sm:w-4" />}
                        <span className="hidden sm:inline">{t(`tabs.${tab}`)}</span>
                        <span className="sm:hidden">{t(`tabs.${tab}`).substring(0, 4)}</span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6">
                {activeTab === 'personal' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('personalInfo.title')}</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('personalInfo.firstName')} <span className="text-red-500">*</span>
                        </label>
                        <UncontrolledInput
                          field="firstName"
                          defaultValue={personalInfo.firstName}
                          onChange={handlePersonalInfoChange}
                          placeholder={t('personalInfo.placeholders.firstName')}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('personalInfo.lastName')} <span className="text-red-500">*</span>
                        </label>
                        <UncontrolledInput
                          field="lastName"
                          defaultValue={personalInfo.lastName}
                          onChange={handlePersonalInfoChange}
                          placeholder={t('personalInfo.placeholders.lastName')}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('personalInfo.ssn')} <span className="text-red-500">*</span>
                        </label>
                        <UncontrolledInput
                          field="ssn"
                          defaultValue={personalInfo.ssn}
                          onChange={handlePersonalInfoChange}
                          placeholder={t('personalInfo.placeholders.ssn')}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('personalInfo.filingStatus')}
                        </label>
                        <select
                          value={personalInfo.filingStatus}
                          onChange={(e) => handlePersonalInfoChange('filingStatus', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        >
                          <option value="single">{t('personalInfo.filingStatuses.single')}</option>
                          <option value="marriedJointly">{t('personalInfo.filingStatuses.marriedJointly')}</option>
                          <option value="marriedSeparately">{t('personalInfo.filingStatuses.marriedSeparately')}</option>
                          <option value="headOfHousehold">{t('personalInfo.filingStatuses.headOfHousehold')}</option>
                        </select>
                        <div className="text-gray-500 text-xs mt-1">
                          💡 {t('personalInfo.help.filingStatus')}
                        </div>
                      </div>
                      
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <input
                            type="checkbox"
                            checked={personalInfo.isMaryland}
                            onChange={(e) => handlePersonalInfoChange('isMaryland', e.target.checked)}
                            className="mr-2"
                          />
                          {t('personalInfo.marylandResident')}
                        </label>
                      </div>
                      
                      {personalInfo.isMaryland && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('personalInfo.county')}
                          </label>
                          <select
                            value={personalInfo.county}
                            onChange={(e) => handlePersonalInfoChange('county', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          >
                            {Object.keys(marylandCountyRates).map(county => (
                              <option key={county} value={county}>{county}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('personalInfo.address')}
                        </label>
                        <ValidatedInput
                          field="address"
                          value={personalInfo.address}
                          onChange={handlePersonalInfoChange}
                          section="personal"
                          placeholder={t('personalInfo.placeholders.address')}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('personalInfo.dependents')}
                        </label>
                        <ValidatedInput
                          field="dependents"
                          value={personalInfo.dependents}
                          onChange={handlePersonalInfoChange}
                          section="personal"
                          type="number"
                          placeholder="0"
                          min="0"
                          max="20"
                          help={t('personalInfo.help.dependents')}
                        />
                      </div>

                      {personalInfo.filingStatus === 'marriedJointly' && (
                        <div className="lg:col-span-2">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-600" />
                                <span className="font-medium text-blue-900">
                                  {spouseInfo.firstName ? 
                                    `${spouseInfo.firstName} ${spouseInfo.lastName}` : 
                                    t('spouseInfo.title')
                                  }
                                </span>
                              </div>
                              <button
                                onClick={() => setShowSpouseDialog(true)}
                                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
                              >
                                {spouseInfo.firstName ? t('spouseInfo.editSpouse') : t('spouseInfo.addSpouse')}
                              </button>
                            </div>
                            {spouseInfo.firstName && (
                              <div className="mt-2 text-sm text-blue-700">
                                Income: {formatCurrency(Object.values(spouseInfo).slice(3, 9).reduce((sum, value) => sum + Number(value), 0))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Income Tab Content */}
                {activeTab === 'income' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('income.title')}</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('income.wages')}
                        </label>
                        <UncontrolledInput
                          field="wages"
                          defaultValue={incomeData.wages}
                          onChange={handleIncomeChange}
                          type="number"
                          placeholder="0"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('income.interestIncome')}
                        </label>
                        <UncontrolledInput
                          field="interestIncome"
                          defaultValue={incomeData.interestIncome}
                          onChange={handleIncomeChange}
                          type="number"
                          placeholder="0"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('income.dividends')}
                        </label>
                        <UncontrolledInput
                          field="dividends"
                          defaultValue={incomeData.dividends}
                          onChange={handleIncomeChange}
                          type="number"
                          placeholder="0"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('income.capitalGains')}
                        </label>
                        <UncontrolledInput
                          field="capitalGains"
                          defaultValue={incomeData.capitalGains}
                          onChange={handleIncomeChange}
                          type="number"
                          placeholder="0"
                          step="0.01"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('income.businessIncome')}
                        </label>
                        <UncontrolledInput
                          field="businessIncome"
                          defaultValue={incomeData.businessIncome}
                          onChange={handleIncomeChange}
                          type="number"
                          placeholder="0"
                          step="0.01"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('income.otherIncome')}
                        </label>
                        <UncontrolledInput
                          field="otherIncome"
                          defaultValue={incomeData.otherIncome}
                          onChange={handleIncomeChange}
                          type="number"
                          placeholder="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    {/* K-1 Forms Section */}
                    <div className="bg-blue-50 p-4 rounded-lg mt-6">
                      <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {t('income.k1Section.title')}
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('income.k1Section.ordinaryIncome')}
                          </label>
                          <UncontrolledInput
                            field="ordinaryIncome"
                            defaultValue={k1Data.ordinaryIncome}
                            onChange={handleK1Change}
                            type="number"
                            placeholder="0"
                            step="0.01"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('income.k1Section.netRentalRealEstate')}
                          </label>
                          <UncontrolledInput
                            field="netRentalRealEstate"
                            defaultValue={k1Data.netRentalRealEstate}
                            onChange={handleK1Change}
                            type="number"
                            placeholder="0"
                            step="0.01"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('income.k1Section.guaranteedPayments')}
                          </label>
                          <UncontrolledInput
                            field="guaranteedPayments"
                            defaultValue={k1Data.guaranteedPayments}
                            onChange={handleK1Change}
                            type="number"
                            placeholder="0"
                            step="0.01"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('income.k1Section.netLongTermCapitalGain')}
                          </label>
                          <UncontrolledInput
                            field="netLongTermCapitalGain"
                            defaultValue={k1Data.netLongTermCapitalGain}
                            onChange={handleK1Change}
                            type="number"
                            placeholder="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Detailed Business Income Section */}
                    <div className="bg-green-50 p-4 rounded-lg mt-6">
                      <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        {t('income.businessDetails.title')}
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('income.businessDetails.grossReceipts')}
                          </label>
                          <UncontrolledInput
                            field="grossReceipts"
                            defaultValue={businessDetails.grossReceipts}
                            onChange={handleBusinessDetailsChange}
                            type="number"
                            placeholder="0"
                            step="0.01"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('income.businessDetails.costOfGoodsSold')}
                          </label>
                          <UncontrolledInput
                            field="costOfGoodsSold"
                            defaultValue={businessDetails.costOfGoodsSold}
                            onChange={handleBusinessDetailsChange}
                            type="number"
                            placeholder="0"
                            step="0.01"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('income.businessDetails.businessExpenses')}
                          </label>
                          <UncontrolledInput
                            field="businessExpenses"
                            defaultValue={businessDetails.businessExpenses}
                            onChange={handleBusinessDetailsChange}
                            type="number"
                            placeholder="0"
                            step="0.01"
                          />
                        </div>
                        
                        <div className="bg-white p-3 rounded border-2 border-green-300">
                          <label className="block text-sm font-medium text-green-800 mb-1">
                            {t('income.businessDetails.netBusinessIncome')}
                          </label>
                          <div className="text-lg font-bold text-green-700">
                            {formatCurrency(
                              (Number(businessDetails.grossReceipts) || 0) - 
                              (Number(businessDetails.costOfGoodsSold) || 0) - 
                              (Number(businessDetails.businessExpenses) || 0)
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payments Tab Content */}
                {activeTab === 'payments' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('payments.title')}</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('payments.federalWithholding')}
                        </label>
                        <ValidatedInput
                          field="federalWithholding"
                          value={paymentsData.federalWithholding}
                          onChange={handlePaymentsChange}
                          section="payments"
                          type="number"
                          placeholder="0"
                          step="0.01"
                          min="0"
                          help={t('payments.descriptions.federalWithholding')}
                        />
                      </div>
                      
                      {personalInfo.isMaryland && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('payments.stateWithholding')}
                          </label>
                          <ValidatedInput
                            field="stateWithholding"
                            value={paymentsData.stateWithholding}
                            onChange={handlePaymentsChange}
                            section="payments"
                            type="number"
                            placeholder="0"
                            step="0.01"
                            min="0"
                            help={t('payments.descriptions.stateWithholding')}
                          />
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('payments.estimatedTaxPayments')}
                        </label>
                        <ValidatedInput
                          field="estimatedTaxPayments"
                          value={paymentsData.estimatedTaxPayments}
                          onChange={handlePaymentsChange}
                          section="payments"
                          type="number"
                          placeholder="0"
                          step="0.01"
                          min="0"
                          help={t('payments.descriptions.estimatedTaxPayments')}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('payments.priorYearOverpayment')}
                        </label>
                        <ValidatedInput
                          field="priorYearOverpayment"
                          value={paymentsData.priorYearOverpayment}
                          onChange={handlePaymentsChange}
                          section="payments"
                          type="number"
                          placeholder="0"
                          step="0.01"
                          min="0"
                          help={t('payments.descriptions.priorYearOverpayment')}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('payments.otherPayments')}
                        </label>
                        <ValidatedInput
                          field="otherPayments"
                          value={paymentsData.otherPayments}
                          onChange={handlePaymentsChange}
                          section="payments"
                          type="number"
                          placeholder="0"
                          step="0.01"
                          min="0"
                          help={t('payments.descriptions.otherPayments')}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg mt-6">
                      <h4 className="font-semibold text-blue-900 mb-2">{t('payments.paymentSummary')}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span>{t('payments.totalPayments')}</span>
                          <span className="font-semibold">
                            {formatCurrency(Object.values(paymentsData).reduce((sum, value) => sum + Number(value), 0))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('payments.federalTaxOwed')}</span>
                          <span className="font-semibold">{formatCurrency(taxResult.federalTax)}</span>
                        </div>
                        {personalInfo.isMaryland && (
                          <>
                            <div className="flex justify-between">
                              <span>{t('payments.stateTaxOwed')}</span>
                              <span className="font-semibold">{formatCurrency(taxResult.marylandTax)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t('payments.localTaxOwed')}</span>
                              <span className="font-semibold">{formatCurrency(taxResult.localTax)}</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between border-t pt-2 col-span-full">
                          <span className="font-semibold">{t('payments.totalTaxOwed')}</span>
                          <span className="font-bold">{formatCurrency(taxResult.totalTax)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Deductions Tab Content */}
                {activeTab === 'deductions' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('deductions.title')}</h3>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={deductions.useStandardDeduction}
                            onChange={() => handleDeductionChange('useStandardDeduction', true)}
                            className="mr-2"
                          />
                          <span className="text-sm sm:text-base">{t('deductions.standardDeduction')} {formatCurrency(deductions.standardDeduction)}</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={!deductions.useStandardDeduction}
                            onChange={() => handleDeductionChange('useStandardDeduction', false)}
                            className="mr-2"
                          />
                          <span className="text-sm sm:text-base">{t('deductions.itemizeDeductions')}</span>
                        </label>
                      </div>
                    </div>

                    {!deductions.useStandardDeduction && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('deductions.mortgageInterest')}
                          </label>
                          <ValidatedInput
                            field="mortgageInterest"
                            value={deductions.mortgageInterest}
                            onChange={handleDeductionChange}
                            section="deductions"
                            type="number"
                            placeholder="0"
                            step="0.01"
                            min="0"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('deductions.stateLocalTaxes')}
                          </label>
                          <ValidatedInput
                            field="stateLocalTaxes"
                            value={deductions.stateLocalTaxes}
                            onChange={(field, value) => handleDeductionChange(field, Math.min(10000, value))}
                            section="deductions"
                            type="number"
                            placeholder="0"
                            max="10000"
                            step="0.01"
                            min="0"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('deductions.charitableContributions')}
                          </label>
                          <ValidatedInput
                            field="charitableContributions"
                            value={deductions.charitableContributions}
                            onChange={handleDeductionChange}
                            section="deductions"
                            type="number"
                            placeholder="0"
                            step="0.01"
                            min="0"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('deductions.medicalExpenses')}
                          </label>
                          <ValidatedInput
                            field="medicalExpenses"
                            value={deductions.medicalExpenses}
                            onChange={handleDeductionChange}
                            section="deductions"
                            type="number"
                            placeholder="0"
                            step="0.01"
                            min="0"
                          />
                        </div>
                        
                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('deductions.otherItemized')}
                          </label>
                          <ValidatedInput
                            field="otherItemized"
                            value={deductions.otherItemized}
                            onChange={handleDeductionChange}
                            section="deductions"
                            type="number"
                            placeholder="0"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 text-center">
            <button
              onClick={calculateTax}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-lg font-semibold"
            >
              <Calculator className="h-5 w-5" />
              {t('actions.recalculate')}
            </button>
            <p className="text-sm text-gray-600 mt-2">
              {language === 'zh' ? '点击按钮计算您的税务' : 
               language === 'es' ? 'Haz clic para calcular tus impuestos' : 
               'Click to calculate your taxes'}
            </p>
          </div>

          {/* Right Panel - Tax Results */}
          <div className="space-y-4 sm:space-y-6">
            {/* Filing Comparison - Show only for married filing jointly */}
            <FilingComparisonCard />

            {/* Tax Calculation Summary */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                {t('results.title')}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span className="text-gray-600">{t('results.adjustedGrossIncome')}</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(taxResult.adjustedGrossIncome)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span className="text-gray-600">{t('results.federalTaxableIncome')}</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(taxResult.taxableIncome)}
                  </span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span className="text-blue-600">{t('results.federalTax')}</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(taxResult.federalTax)}
                  </span>
                </div>
                {personalInfo.isMaryland && (
                  <>
                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-yellow-600">{t('results.marylandTax')}</span>
                      <span className="font-bold text-yellow-600">
                        {formatCurrency(taxResult.marylandTax)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-purple-600">{t('results.localTax')} ({personalInfo.county}):</span>
                      <span className="font-bold text-purple-600">
                        {formatCurrency(taxResult.localTax)}
                      </span>
                    </div>
                  </>
                )}
                <hr className="my-3" />
                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span className="text-red-600">{t('results.totalTax')}</span>
                  <span className="font-bold text-red-600 text-lg">
                    {formatCurrency(taxResult.totalTax)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span className="text-blue-600">{t('results.totalPayments')}</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(taxResult.totalPayments)}
                  </span>
                </div>
                <hr className="my-3" />
                {taxResult.refundAmount > 0 ? (
                  <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg">
                    <span className="text-sm text-green-700 font-semibold">{t('results.refundAmount')}</span>
                    <span className="font-bold text-green-700 text-lg sm:text-xl">
                      {formatCurrency(taxResult.refundAmount)}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center bg-red-50 p-3 rounded-lg">
                    <span className="text-sm text-red-700 font-semibold">{t('results.amountOwed')}</span>
                    <span className="font-bold text-red-700 text-lg sm:text-xl">
                      {formatCurrency(taxResult.amountOwed)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span className="text-orange-600">{t('results.effectiveRate')}</span>
                  <span className="font-semibold text-orange-600">
                    {formatPercentage(taxResult.effectiveRate)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span className="text-indigo-600">{t('results.marginalRate')}</span>
                  <span className="font-semibold text-indigo-600">
                    {formatPercentage(taxResult.marginalRate)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span className="text-green-600">{t('results.afterTaxIncome')}</span>
                  <span className="font-bold text-green-600 text-lg">
                    {formatCurrency(taxResult.afterTaxIncome)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('actions.title')}</h3>
              <div className="space-y-3">
                <button
                  onClick={exportToPDF}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <FileText className="h-4 w-4" />
                  {t('actions.exportPDF')}
                </button>
                <button
                  onClick={exportTaxReturn}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Download className="h-4 w-4" />
                  {t('actions.exportJSON')}
                </button>
                <button
                  onClick={calculateTax}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Calculator className="h-4 w-4" />
                  {t('actions.recalculate')}
                </button>
              </div>
            </div>

            {/* Federal Tax Bracket Reference */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('taxBrackets.title')}</h3>
              <div className="text-xs space-y-1 overflow-x-auto">
                <div className="grid grid-cols-2 gap-2 font-semibold border-b pb-1 min-w-max">
                  <span>{t('taxBrackets.taxableIncome')}</span>
                  <span>{t('taxBrackets.rate')}</span>
                </div>
                {federalTaxBrackets[personalInfo.filingStatus]?.map((bracket, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2 text-gray-600 min-w-max">
                    <span className="text-xs">
                      {formatCurrency(bracket.min)} - {bracket.max === Infinity ? '∞' : formatCurrency(bracket.max)}
                    </span>
                    <span>{formatPercentage(bracket.rate)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Maryland Tax Info */}
            {personalInfo.isMaryland && (
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-yellow-600" />
                  {t('marylandInfo.title')}
                </h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>{t('marylandInfo.stateRateRange')}</span>
                    <span>2% - 5.75%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('marylandInfo.localTaxRate')} ({personalInfo.county}):</span>
                    <span>{formatPercentage(marylandCountyRates[personalInfo.county] || 0.032)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('marylandInfo.standardDeduction')}</span>
                    <span>{formatCurrency(personalInfo.filingStatus === 'marriedJointly' ? 4850 : 2400)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tax Burden Chart */}
            <TaxBurdenChart />

            {/* Filing Status Info */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('standardDeductions.title')}</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>{t('standardDeductions.single')}</span>
                  <span>{formatCurrency(15750)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('standardDeductions.marriedJointly')}</span>
                  <span>{formatCurrency(31500)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('standardDeductions.marriedSeparately')}</span>
                  <span>{formatCurrency(15750)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('standardDeductions.headOfHousehold')}</span>
                  <span>{formatCurrency(23625)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Spouse Dialog */}
      <SpouseDialog />
    </div>
  );
}