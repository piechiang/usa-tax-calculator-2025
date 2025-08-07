export const translations = {
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
        marriedJointly: "已婚合并报税",
        marriedSeparately: "已婚分别报税",
        headOfHousehold: "户主"
      },
      placeholders: {
        firstName: "输入名字",
        lastName: "输入姓氏",
        ssn: "XXX-XX-XXXX",
        address: "输入地址"
      },
      help: {
        ssn: "您社会安全卡上显示的9位社会安全号码",
        dependents: "您在经济上支持的子女和其他符合条件的亲属",
        filingStatus: "选择适用于您在2025年12月31日情况的身份"
      }
    },
    spouseInfo: {
      title: "配偶信息",
      subtitle: "为合并报税输入您配偶的信息",
      firstName: "配偶名字",
      lastName: "配偶姓氏",
      ssn: "配偶社会安全号码",
      income: "配偶收入",
      wages: "配偶工资",
      withholding: "配偶税款预扣",
      addSpouse: "添加配偶信息",
      editSpouse: "编辑配偶信息",
      removeSpouse: "删除配偶信息",
      filingComparison: "报税身份比较",
      recommendedFiling: "推荐报税身份",
      jointSavings: "合并报税节省",
      separateSavings: "分别报税节省"
    },
    income: {
      title: "收入信息",
      wages: "工资、薪水、小费 (W-2)",
      interestIncome: "利息收入 (1099-INT)",
      dividends: "股息收入 (1099-DIV)",
      capitalGains: "资本收益",
      businessIncome: "营业收入 (附表C)",
      otherIncome: "其他收入",
      k1Income: "K-1合伙/S公司收入",
      k1Section: {
        title: "K-1表格（合伙企业/S公司）",
        ordinaryIncome: "普通营业收入 (第1栏)",
        netRentalRealEstate: "净租赁房地产收入 (第2栏)",
        otherRentalIncome: "其他租赁收入 (第3栏)",
        guaranteedPayments: "保证付款 (第4栏)",
        interestIncome: "利息收入 (第5栏)",
        dividends: "普通股息 (第6A栏)",
        royalties: "版税收入 (第7栏)",
        netShortTermCapitalGain: "净短期资本收益 (第8A栏)",
        netLongTermCapitalGain: "净长期资本收益 (第9A栏)",
        otherPortfolioIncome: "其他投资组合收入 (第11栏)"
      },
      businessDetails: {
        title: "详细营业收入 (附表C)",
        grossReceipts: "总收入或销售额",
        costOfGoodsSold: "销售成本",
        grossProfit: "毛利润",
        businessExpenses: "总营业费用",
        netBusinessIncome: "净营业收入"
      },
      help: {
        wages: "输入您所有W-2表格第1栏的总额",
        interestIncome: "来自银行、债券和其他来源的利息",
        dividends: "来自股票和共同基金的股息",
        capitalGains: "出售投资或财产的利润",
        k1Income: "来自合伙企业、S公司或有限责任公司的收入"
      }
    },
    payments: {
      title: "税款支付和预扣",
      federalWithholding: "联邦所得税预扣 (W-2表格，第2栏)",
      stateWithholding: "马里兰州税预扣 (W-2表格，第17栏)",
      estimatedTaxPayments: "2025年预估税款支付",
      priorYearOverpayment: "上年度超额缴款已用",
      otherPayments: "其他付款和抵免",
      paymentSummary: "付款摘要",
      totalPayments: "总付款额：",
      federalTaxOwed: "联邦税应缴：",
      stateTaxOwed: "州税应缴：",
      localTaxOwed: "地方税应缴：",
      totalTaxOwed: "总税款应缴：",
      descriptions: {
        federalWithholding: "输入您W-2表格第2栏的金额",
        stateWithholding: "输入您W-2表格第17栏马里兰州预扣税",
        estimatedTaxPayments: "2025年按季度支付的预估税款",
        priorYearOverpayment: "2024年退税用于2025年税款",
        otherPayments: "额外付款、抵免或预扣"
      }
    },
    deductions: {
      title: "扣除项目",
      standardDeduction: "标准扣除：",
      itemizeDeductions: "分项扣除",
      mortgageInterest: "抵押贷款利息",
      stateLocalTaxes: "州和地方税 (SALT) - 最高$10,000",
      charitableContributions: "慈善捐款",
      medicalExpenses: "医疗费用 (超过AGI的7.5%)",
      otherItemized: "其他分项扣除"
    },
    results: {
      title: "税款计算 (2025)",
      adjustedGrossIncome: "调整后总收入：",
      federalTaxableIncome: "联邦应税收入：",
      federalTax: "联邦税：",
      marylandTax: "马里兰州税：",
      localTax: "地方税",
      totalTax: "总应缴税款：",
      totalPayments: "总付款额：",
      refundAmount: "💰 退税金额：",
      amountOwed: "💸 您需要缴纳：",
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
      title: "2025年联邦税率等级",
      taxableIncome: "应税收入",
      rate: "税率"
    },
    marylandInfo: {
      title: "马里兰税信息",
      stateRateRange: "州税率范围：",
      localTaxRate: "地方税率",
      standardDeduction: "MD标准扣除："
    },
    standardDeductions: {
      title: "2025年标准扣除",
      single: "单身：",
      marriedJointly: "已婚合并：",
      marriedSeparately: "已婚分别：",
      headOfHousehold: "户主："
    }
  },
  es: {
    title: "Calculadora de Impuestos Federales de EE.UU. y Maryland 2025",
    subtitle: "Calcule sus impuestos federales y estatales de Maryland 2025 con tasas y deducciones actualizadas",
    disclaimer: "Actualizaciones del Año Fiscal 2025: Deducciones estándar aumentaron - Soltero: $15,750, Casado Conjunto: $31,500. Las tasas federales permanecen en 10%, 12%, 22%, 24%, 32%, 35% y 37% con umbrales de ingresos ajustados. Solo para propósitos de estimación - consulte a un profesional de impuestos para la presentación real.",
    validation: {
      required: "Este campo es obligatorio",
      invalidSSN: "Por favor ingrese un SSN válido (XXX-XX-XXXX)",
      negativeAmount: "La cantidad no puede ser negativa",
      tooLarge: "La cantidad parece excesivamente grande",
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
        marriedSeparately: "Casado Presentando por Separado",
        headOfHousehold: "Cabeza de Familia"
      },
      placeholders: {
        firstName: "Ingrese nombre",
        lastName: "Ingrese apellido",
        ssn: "XXX-XX-XXXX",
        address: "Ingrese dirección"
      },
      help: {
        ssn: "Su Número de Seguro Social de 9 dígitos como aparece en su tarjeta de Seguro Social",
        dependents: "Hijos y otros familiares calificados que usted mantiene financieramente",
        filingStatus: "Elija el estado que aplique a su situación el 31 de diciembre de 2025"
      }
    },
    spouseInfo: {
      title: "Información del Cónyuge",
      subtitle: "Ingrese la información de su cónyuge para presentación conjunta",
      firstName: "Nombre del Cónyuge",
      lastName: "Apellido del Cónyuge",
      ssn: "SSN del Cónyuge",
      income: "Ingresos del Cónyuge",
      wages: "Salarios del Cónyuge",
      withholding: "Retención de Impuestos del Cónyuge",
      addSpouse: "Agregar Información del Cónyuge",
      editSpouse: "Editar Información del Cónyuge",
      removeSpouse: "Eliminar Información del Cónyuge",
      filingComparison: "Comparación de Estados de Presentación",
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
      businessIncome: "Ingresos Comerciales (Anexo C)",
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
        netShortTermCapitalGain: "Ganancia de Capital Neta a Corto Plazo (Casilla 8A)",
        netLongTermCapitalGain: "Ganancia de Capital Neta a Largo Plazo (Casilla 9A)",
        otherPortfolioIncome: "Otros Ingresos de Cartera (Casilla 11)"
      },
      businessDetails: {
        title: "Ingresos Comerciales Detallados (Anexo C)",
        grossReceipts: "Ingresos Brutos o Ventas",
        costOfGoodsSold: "Costo de Bienes Vendidos",
        grossProfit: "Beneficio Bruto",
        businessExpenses: "Gastos Comerciales Totales",
        netBusinessIncome: "Ingresos Comerciales Netos"
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
      federalWithholding: "Impuesto Federal sobre la Renta Retenido (Formulario W-2, Casilla 2)",
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
        federalWithholding: "Ingrese la cantidad de su formulario W-2, casilla 2",
        stateWithholding: "Ingrese el impuesto estatal de Maryland retenido de su formulario W-2, casilla 17",
        estimatedTaxPayments: "Pagos de impuestos estimados trimestrales realizados para 2025",
        priorYearOverpayment: "Reembolso de 2024 aplicado a impuestos de 2025",
        otherPayments: "Pagos adicionales, créditos o retenciones"
      }
    },
    deductions: {
      title: "Deducciones",
      standardDeduction: "Deducción Estándar:",
      itemizeDeductions: "Desglosar Deducciones",
      mortgageInterest: "Interés Hipotecario",
      stateLocalTaxes: "Impuestos Estatales y Locales (SALT) - Máx. $10,000",
      charitableContributions: "Contribuciones Caritativas",
      medicalExpenses: "Gastos Médicos (por encima del 7.5% AGI)",
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
      refundAmount: "💰 Cantidad del Reembolso:",
      amountOwed: "💸 Cantidad que Debe:",
      effectiveRate: "Tasa de Impuesto Efectiva:",
      marginalRate: "Tasa de Impuesto Marginal:",
      afterTaxIncome: "Ingreso Después de Impuestos:"
    },
    actions: {
      title: "Acciones",
      exportPDF: "Exportar Formulario 1040 PDF",
      exportJSON: "Exportar Datos Fiscales (JSON)",
      recalculate: "Recalcular"
    },
    taxBrackets: {
      title: "Niveles de Impuestos Federales 2025",
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
      marriedSeparately: "Casado Presentando por Separado:",
      headOfHousehold: "Cabeza de Familia:"
    }
  }
};