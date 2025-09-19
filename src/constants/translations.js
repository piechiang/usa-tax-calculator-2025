export const translations = {
  en: {
    title: "USA Tax Calculator 2025",
    subtitle: "Estimate your 2025 federal and Maryland state income taxes with updated rates and deductions.",
    disclaimer: "For planning only. Not tax or legal advice. Consult a professional for filing.",
    privacyNotice: "Privacy Notice: All calculations run locally in your browser. No data is sent to a server.",
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
        ssn: "As shown on your Social Security card",
        dependents: "Children and other qualifying relatives you support",
        filingStatus: "Status as of December 31, 2025"
      }
    },
    spouseInfo: {
      title: "Spouse Information",
      subtitle: "Enter spouse information for joint filing",
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
      }
    },
    payments: {
      title: "Tax Payments & Withholdings",
      federalWithholding: "Federal Income Tax Withheld (W-2 Box 2)",
      stateWithholding: "Maryland State Tax Withheld (W-2 Box 17)",
      estimatedTaxPayments: "2025 Estimated Tax Payments",
      priorYearOverpayment: "Prior Year Overpayment Applied",
      otherPayments: "Other Payments & Credits",
      paymentSummary: "Payment Summary",
      totalPayments: "Total Payments:",
      federalTaxOwed: "Federal Tax Owed:",
      stateTaxOwed: "State Tax Owed:",
      localTaxOwed: "Local Tax Owed:",
      totalTaxOwed: "Total Tax Owed:"
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
      localTax: "Local Tax:",
      totalTax: "Total Tax Owed:",
      totalPayments: "Total Payments:",
      refundAmount: "Refund Amount:",
      amountOwed: "Amount You Owe:",
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
    },
    assistant: {
      title: "AI Tax Assistant",
      subtitle: "Get instant answers to your tax questions",
      placeholder: "Ask me anything about taxes...",
      greeting: "Hello! I'm your AI tax assistant. I can help you with tax questions, optimization strategies, and understanding your tax situation. What would you like to know?",
      suggestions: [
        "How can I reduce my tax burden?",
        "What deductions am I eligible for?",
        "Should I itemize or take the standard deduction?",
        "Explain my tax calculation"
      ],
      quickActions: [
        { label: "Calculate Savings", query: "How can I reduce my tax burden?" },
        { label: "Deduction Help", query: "What deductions am I eligible for?" },
        { label: "Tax Strategy", query: "What tax planning strategies should I consider?" },
        { label: "General Tips", query: "Give me your best tax tips" }
      ],
      tip: "Tip: Ask about deductions, tax strategies, or specific tax scenarios"
    }
  },
  zh: {
    title: "美国税务计算器 2025",
    subtitle: "使用最新税率和扣除额估算您的2025年联邦和马里兰州所得税。",
    disclaimer: "仅供规划使用。非税务或法律建议。请咨询专业人士进行申报。",
    privacyNotice: "隐私声明：所有计算均在您的浏览器本地运行。数据不会发送到服务器。",
    validation: {
      required: "此字段为必填项",
      invalidSSN: "请输入有效的社会保险号 (XXX-XX-XXXX)",
      negativeAmount: "金额不能为负数",
      tooLarge: "金额似乎过大",
      invalidDependents: "受抚养人数必须在0到20之间"
    },
    tabs: {
      personal: "个人信息",
      income: "收入",
      payments: "付款",
      deductions: "扣除额"
    },
    personalInfo: {
      title: "个人信息",
      firstName: "名字",
      lastName: "姓氏",
      ssn: "社会保险号",
      filingStatus: "申报状态",
      address: "地址",
      dependents: "受抚养人数",
      marylandResident: "马里兰州居民",
      county: "马里兰县/市",
      filingStatuses: {
        single: "单身",
        marriedJointly: "已婚联合申报",
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
        ssn: "如您社会保险卡上显示的",
        dependents: "您抚养的子女和其他符合条件的亲属",
        filingStatus: "截至2025年12月31日的状态"
      }
    },
    spouseInfo: {
      title: "配偶信息",
      subtitle: "输入配偶信息以进行联合申报",
      firstName: "配偶名字",
      lastName: "配偶姓氏",
      ssn: "配偶社会保险号",
      income: "配偶收入",
      wages: "配偶工资",
      withholding: "配偶税务预扣",
      addSpouse: "添加配偶信息",
      editSpouse: "编辑配偶信息",
      removeSpouse: "删除配偶信息",
      filingComparison: "申报状态比较",
      recommendedFiling: "推荐申报状态",
      jointSavings: "联合申报节省",
      separateSavings: "分别申报节省"
    },
    income: {
      title: "收入信息",
      wages: "工资、薪金、小费 (W-2)",
      interestIncome: "利息收入 (1099-INT)",
      dividends: "股息收入 (1099-DIV)",
      capitalGains: "资本收益",
      businessIncome: "商业收入 (附表C)",
      otherIncome: "其他收入",
      k1Income: "K-1合伙企业/S型公司收入",
      k1Section: {
        title: "K-1表格 (合伙企业/S型公司)",
        ordinaryIncome: "普通商业收入 (第1栏)",
        netRentalRealEstate: "净租赁房地产 (第2栏)",
        otherRentalIncome: "其他租赁收入 (第3栏)",
        guaranteedPayments: "保证付款 (第4栏)",
        interestIncome: "利息收入 (第5栏)",
        dividends: "普通股息 (第6A栏)",
        royalties: "特许权使用费 (第7栏)",
        netShortTermCapitalGain: "净短期资本收益 (第8A栏)",
        netLongTermCapitalGain: "净长期资本收益 (第9A栏)",
        otherPortfolioIncome: "其他投资组合收入 (第11栏)"
      },
      businessDetails: {
        title: "详细商业收入 (附表C)",
        grossReceipts: "总收入或销售额",
        costOfGoodsSold: "销售成本",
        grossProfit: "毛利润",
        businessExpenses: "商业费用总额",
        netBusinessIncome: "净商业收入"
      }
    },
    payments: {
      title: "税务付款和预扣",
      federalWithholding: "联邦所得税预扣 (W-2第2栏)",
      stateWithholding: "马里兰州税预扣 (W-2第17栏)",
      estimatedTaxPayments: "2025年预估税款",
      priorYearOverpayment: "前一年度多付款项",
      otherPayments: "其他付款和抵免",
      paymentSummary: "付款摘要",
      totalPayments: "总付款额：",
      federalTaxOwed: "联邦税欠款：",
      stateTaxOwed: "州税欠款：",
      localTaxOwed: "地方税欠款：",
      totalTaxOwed: "总税款欠额："
    },
    deductions: {
      title: "扣除额",
      standardDeduction: "标准扣除额：",
      itemizeDeductions: "逐项扣除",
      mortgageInterest: "抵押贷款利息",
      stateLocalTaxes: "州和地方税 (SALT) - 最高$10,000",
      charitableContributions: "慈善捐款",
      medicalExpenses: "医疗费用 (超过AGI的7.5%)",
      otherItemized: "其他逐项扣除"
    },
    results: {
      title: "税务计算 (2025)",
      adjustedGrossIncome: "调整后总收入：",
      federalTaxableIncome: "联邦应税收入：",
      federalTax: "联邦税：",
      marylandTax: "马里兰州税：",
      localTax: "地方税：",
      totalTax: "总税款：",
      totalPayments: "总付款额：",
      refundAmount: "退款金额：",
      amountOwed: "您应缴金额：",
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
      title: "2025年联邦税率级距",
      taxableIncome: "应税收入",
      rate: "税率"
    },
    marylandInfo: {
      title: "马里兰税务信息",
      stateRateRange: "州税率范围：",
      localTaxRate: "地方税率",
      standardDeduction: "MD标准扣除额："
    },
    standardDeductions: {
      title: "2025年标准扣除额",
      single: "单身：",
      marriedJointly: "已婚联合申报：",
      marriedSeparately: "已婚分别申报：",
      headOfHousehold: "户主："
    },
    assistant: {
      title: "AI税务助手",
      subtitle: "获得税务问题的即时解答",
      placeholder: "询问我任何税务问题...",
      greeting: "您好！我是您的AI税务助手。我可以帮助您解答税务问题、优化策略，并了解您的税务状况。您想了解什么？",
      suggestions: [
        "如何减少我的税务负担？",
        "我符合哪些扣除条件？",
        "我应该逐项扣除还是采用标准扣除？",
        "解释我的税务计算"
      ],
      quickActions: [
        { label: "计算节省", query: "如何减少我的税务负担？" },
        { label: "扣除帮助", query: "我符合哪些扣除条件？" },
        { label: "税务策略", query: "我应该考虑哪些税务规划策略？" },
        { label: "一般建议", query: "给我您最好的税务建议" }
      ],
      tip: "提示：询问扣除、税务策略或具体税务情况"
    }
  },
  es: {
    title: "Calculadora de Impuestos de EE.UU. 2025",
    subtitle: "Estime sus impuestos federales y estatales de Maryland para 2025 con tasas y deducciones actualizadas.",
    disclaimer: "Solo para planificación. No es asesoramiento fiscal o legal. Consulte a un profesional para la presentación.",
    privacyNotice: "Aviso de Privacidad: Todos los cálculos se ejecutan localmente en su navegador. No se envían datos a un servidor.",
    validation: {
      required: "Este campo es obligatorio",
      invalidSSN: "Por favor ingrese un SSN válido (XXX-XX-XXXX)",
      negativeAmount: "La cantidad no puede ser negativa",
      tooLarge: "La cantidad parece excesivamente grande",
      invalidDependents: "El número de dependientes debe estar entre 0 y 20"
    },
    tabs: {
      personal: "Información Personal",
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
        headOfHousehold: "Jefe de Familia"
      },
      placeholders: {
        firstName: "Ingrese el nombre",
        lastName: "Ingrese el apellido",
        ssn: "XXX-XX-XXXX",
        address: "Ingrese la dirección"
      },
      help: {
        ssn: "Como aparece en su tarjeta de Seguro Social",
        dependents: "Hijos y otros parientes calificados que mantiene",
        filingStatus: "Estado al 31 de diciembre de 2025"
      }
    },
    spouseInfo: {
      title: "Información del Cónyuge",
      subtitle: "Ingrese la información del cónyuge para presentación conjunta",
      firstName: "Nombre del Cónyuge",
      lastName: "Apellido del Cónyuge",
      ssn: "SSN del Cónyuge",
      income: "Ingresos del Cónyuge",
      wages: "Salarios del Cónyuge",
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
        ordinaryIncome: "Ingresos Ordinarios de Negocio (Casilla 1)",
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
        title: "Ingresos Detallados del Negocio (Anexo C)",
        grossReceipts: "Recibos Brutos o Ventas",
        costOfGoodsSold: "Costo de Bienes Vendidos",
        grossProfit: "Ganancia Bruta",
        businessExpenses: "Gastos Totales del Negocio",
        netBusinessIncome: "Ingresos Netos del Negocio"
      }
    },
    payments: {
      title: "Pagos de Impuestos y Retenciones",
      federalWithholding: "Impuesto Federal Retenido (W-2 Casilla 2)",
      stateWithholding: "Impuesto Estatal de Maryland Retenido (W-2 Casilla 17)",
      estimatedTaxPayments: "Pagos de Impuestos Estimados 2025",
      priorYearOverpayment: "Sobrepago del Año Anterior Aplicado",
      otherPayments: "Otros Pagos y Créditos",
      paymentSummary: "Resumen de Pagos",
      totalPayments: "Pagos Totales:",
      federalTaxOwed: "Impuesto Federal Adeudado:",
      stateTaxOwed: "Impuesto Estatal Adeudado:",
      localTaxOwed: "Impuesto Local Adeudado:",
      totalTaxOwed: "Impuesto Total Adeudado:"
    },
    deductions: {
      title: "Deducciones",
      standardDeduction: "Deducción Estándar:",
      itemizeDeductions: "Detallar Deducciones",
      mortgageInterest: "Intereses Hipotecarios",
      stateLocalTaxes: "Impuestos Estatales y Locales (SALT) - Máx $10,000",
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
      localTax: "Impuesto Local:",
      totalTax: "Impuesto Total Adeudado:",
      totalPayments: "Pagos Totales:",
      refundAmount: "Cantidad de Reembolso:",
      amountOwed: "Cantidad que Debe:",
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
      marriedSeparately: "Casado Presentando por Separado:",
      headOfHousehold: "Jefe de Familia:"
    },
    assistant: {
      title: "Asistente Fiscal AI",
      subtitle: "Obtenga respuestas instantáneas a sus preguntas fiscales",
      placeholder: "Pregúnteme cualquier cosa sobre impuestos...",
      greeting: "¡Hola! Soy su asistente fiscal de IA. Puedo ayudarle con preguntas fiscales, estrategias de optimización y entender su situación fiscal. ¿Qué le gustaría saber?",
      suggestions: [
        "¿Cómo puedo reducir mi carga fiscal?",
        "¿Para qué deducciones soy elegible?",
        "¿Debería detallar o tomar la deducción estándar?",
        "Explique mi cálculo de impuestos"
      ],
      quickActions: [
        { label: "Calcular Ahorros", query: "¿Cómo puedo reducir mi carga fiscal?" },
        { label: "Ayuda Deducciones", query: "¿Para qué deducciones soy elegible?" },
        { label: "Estrategia Fiscal", query: "¿Qué estrategias de planificación fiscal debería considerar?" },
        { label: "Consejos Generales", query: "Deme sus mejores consejos fiscales" }
      ],
      tip: "Consejo: Pregunte sobre deducciones, estrategias fiscales o escenarios fiscales específicos"
    }
  }
};
