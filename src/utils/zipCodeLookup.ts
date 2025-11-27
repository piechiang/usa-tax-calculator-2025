/**
 * 邮编自动识别功能
 * 根据邮编自动填充城市、州信息
 */

interface StateTaxInfo {
  name: string;
  hasTax: boolean;
  rate: string;
}

interface ZipLocation {
  state: string;
  city: string;
  county: string;
}

interface ZipLookupResult {
  zipCode: string;
  city: string | null;
  state: string;
  stateName: string;
  county: string | null;
  taxInfo: {
    hasStateTax: boolean | null;
    stateRate: string;
    recommendation: string;
  };
  source: string;
  note?: string;
}

interface TaxAdvice {
  state?: string;
  rate?: string;
  hasStateTax?: boolean;
  advice: string | string[];
}

// 美国州税信息（2025年）
const STATE_TAX_INFO: Record<string, StateTaxInfo> = {
  'AL': { name: 'Alabama', hasTax: true, rate: '2-5%' },
  'AK': { name: 'Alaska', hasTax: false, rate: '0%' },
  'AZ': { name: 'Arizona', hasTax: true, rate: '2.59-4.5%' },
  'AR': { name: 'Arkansas', hasTax: true, rate: '0.9-5.9%' },
  'CA': { name: 'California', hasTax: true, rate: '1-13.3%' },
  'CO': { name: 'Colorado', hasTax: true, rate: '4.4%' },
  'CT': { name: 'Connecticut', hasTax: true, rate: '3-6.99%' },
  'DE': { name: 'Delaware', hasTax: true, rate: '0-6.6%' },
  'FL': { name: 'Florida', hasTax: false, rate: '0%' },
  'GA': { name: 'Georgia', hasTax: true, rate: '1-5.75%' },
  'HI': { name: 'Hawaii', hasTax: true, rate: '1.4-11%' },
  'ID': { name: 'Idaho', hasTax: true, rate: '1.125-6.925%' },
  'IL': { name: 'Illinois', hasTax: true, rate: '4.95%' },
  'IN': { name: 'Indiana', hasTax: true, rate: '3.23%' },
  'IA': { name: 'Iowa', hasTax: true, rate: '0.33-8.53%' },
  'KS': { name: 'Kansas', hasTax: true, rate: '3.1-5.7%' },
  'KY': { name: 'Kentucky', hasTax: true, rate: '5%' },
  'LA': { name: 'Louisiana', hasTax: true, rate: '2-6%' },
  'ME': { name: 'Maine', hasTax: true, rate: '5.8-7.15%' },
  'MD': { name: 'Maryland', hasTax: true, rate: '2-5.75%' },
  'MA': { name: 'Massachusetts', hasTax: true, rate: '5%' },
  'MI': { name: 'Michigan', hasTax: true, rate: '4.25%' },
  'MN': { name: 'Minnesota', hasTax: true, rate: '5.35-9.85%' },
  'MS': { name: 'Mississippi', hasTax: true, rate: '0-5%' },
  'MO': { name: 'Missouri', hasTax: true, rate: '1.5-5.4%' },
  'MT': { name: 'Montana', hasTax: true, rate: '1-6.9%' },
  'NE': { name: 'Nebraska', hasTax: true, rate: '2.46-6.84%' },
  'NV': { name: 'Nevada', hasTax: false, rate: '0%' },
  'NH': { name: 'New Hampshire', hasTax: false, rate: '0%' },
  'NJ': { name: 'New Jersey', hasTax: true, rate: '1.4-10.75%' },
  'NM': { name: 'New Mexico', hasTax: true, rate: '1.7-5.9%' },
  'NY': { name: 'New York', hasTax: true, rate: '4-10.9%' },
  'NC': { name: 'North Carolina', hasTax: true, rate: '4.75%' },
  'ND': { name: 'North Dakota', hasTax: true, rate: '1.1-2.9%' },
  'OH': { name: 'Ohio', hasTax: true, rate: '0-3.99%' },
  'OK': { name: 'Oklahoma', hasTax: true, rate: '0.25-5%' },
  'OR': { name: 'Oregon', hasTax: true, rate: '4.75-9.9%' },
  'PA': { name: 'Pennsylvania', hasTax: true, rate: '3.07%' },
  'RI': { name: 'Rhode Island', hasTax: true, rate: '3.75-5.99%' },
  'SC': { name: 'South Carolina', hasTax: true, rate: '0-7%' },
  'SD': { name: 'South Dakota', hasTax: false, rate: '0%' },
  'TN': { name: 'Tennessee', hasTax: false, rate: '0%' },
  'TX': { name: 'Texas', hasTax: false, rate: '0%' },
  'UT': { name: 'Utah', hasTax: true, rate: '4.85%' },
  'VT': { name: 'Vermont', hasTax: true, rate: '3.35-8.75%' },
  'VA': { name: 'Virginia', hasTax: true, rate: '2-5.75%' },
  'WA': { name: 'Washington', hasTax: false, rate: '0%' },
  'WV': { name: 'West Virginia', hasTax: true, rate: '3-6.5%' },
  'WI': { name: 'Wisconsin', hasTax: true, rate: '3.54-7.65%' },
  'WY': { name: 'Wyoming', hasTax: false, rate: '0%' },
  'DC': { name: 'District of Columbia', hasTax: true, rate: '4-10.75%' }
};

// 常见邮编到州的映射（部分示例）
const ZIP_TO_STATE: Record<string, ZipLocation> = {
  // California
  '90210': { state: 'CA', city: 'Beverly Hills', county: 'Los Angeles' },
  '94102': { state: 'CA', city: 'San Francisco', county: 'San Francisco' },
  '94105': { state: 'CA', city: 'San Francisco', county: 'San Francisco' },
  '95014': { state: 'CA', city: 'Cupertino', county: 'Santa Clara' },
  '90028': { state: 'CA', city: 'Los Angeles', county: 'Los Angeles' },
  
  // New York
  '10001': { state: 'NY', city: 'New York', county: 'New York' },
  '10019': { state: 'NY', city: 'New York', county: 'New York' },
  '10036': { state: 'NY', city: 'New York', county: 'New York' },
  '11201': { state: 'NY', city: 'Brooklyn', county: 'Kings' },
  
  // Texas (无州税)
  '75201': { state: 'TX', city: 'Dallas', county: 'Dallas' },
  '77001': { state: 'TX', city: 'Houston', county: 'Harris' },
  '78701': { state: 'TX', city: 'Austin', county: 'Travis' },
  
  // Florida (无州税)
  '33101': { state: 'FL', city: 'Miami', county: 'Miami-Dade' },
  '32801': { state: 'FL', city: 'Orlando', county: 'Orange' },
  
  // Washington (无州税)
  '98101': { state: 'WA', city: 'Seattle', county: 'King' },
  '98052': { state: 'WA', city: 'Redmond', county: 'King' },
  
  // Massachusetts
  '02101': { state: 'MA', city: 'Boston', county: 'Suffolk' },
  '02139': { state: 'MA', city: 'Cambridge', county: 'Middlesex' },
  
  // Illinois
  '60601': { state: 'IL', city: 'Chicago', county: 'Cook' },
  '60614': { state: 'IL', city: 'Chicago', county: 'Cook' },
  
  // Virginia
  '22101': { state: 'VA', city: 'McLean', county: 'Fairfax' },
  '20120': { state: 'VA', city: 'Centreville', county: 'Fairfax' },
  
  // Maryland
  '20910': { state: 'MD', city: 'Silver Spring', county: 'Montgomery' },
  '21201': { state: 'MD', city: 'Baltimore', county: 'Baltimore City' },
  
  // New Jersey
  '07030': { state: 'NJ', city: 'Hoboken', county: 'Hudson' },
  '08540': { state: 'NJ', city: 'Princeton', county: 'Mercer' },
  
  // Pennsylvania
  '19101': { state: 'PA', city: 'Philadelphia', county: 'Philadelphia' },
  '15201': { state: 'PA', city: 'Pittsburgh', county: 'Allegheny' },
  
  // Ohio
  '43215': { state: 'OH', city: 'Columbus', county: 'Franklin' },
  '44101': { state: 'OH', city: 'Cleveland', county: 'Cuyahoga' },
  
  // Michigan
  '48201': { state: 'MI', city: 'Detroit', county: 'Wayne' },
  '48104': { state: 'MI', city: 'Ann Arbor', county: 'Washtenaw' },
  
  // North Carolina
  '27601': { state: 'NC', city: 'Raleigh', county: 'Wake' },
  '28201': { state: 'NC', city: 'Charlotte', county: 'Mecklenburg' },
  
  // Georgia
  '30301': { state: 'GA', city: 'Atlanta', county: 'Fulton' },
  '30309': { state: 'GA', city: 'Atlanta', county: 'Fulton' },
  
  // Colorado
  '80201': { state: 'CO', city: 'Denver', county: 'Denver' },
  '80301': { state: 'CO', city: 'Boulder', county: 'Boulder' },
  
  // Arizona
  '85001': { state: 'AZ', city: 'Phoenix', county: 'Maricopa' },
  '85701': { state: 'AZ', city: 'Tucson', county: 'Pima' },
  
  // Oregon
  '97201': { state: 'OR', city: 'Portland', county: 'Multnomah' },
  '97401': { state: 'OR', city: 'Eugene', county: 'Lane' },
  
  // Utah
  '84101': { state: 'UT', city: 'Salt Lake City', county: 'Salt Lake' },
  '84604': { state: 'UT', city: 'Provo', county: 'Utah' },
  
  // Nevada (无州税)
  '89101': { state: 'NV', city: 'Las Vegas', county: 'Clark' },
  '89501': { state: 'NV', city: 'Reno', county: 'Washoe' }
};

// 根据邮编前缀识别州（备用方法）
const ZIP_PREFIX_TO_STATE: Record<string, string> = {
  '00': 'PR', // Puerto Rico
  '01': 'MA', '02': 'MA', '03': 'NH', '04': 'ME', '05': 'VT',
  '06': 'CT', '07': 'NJ', '08': 'NJ', '09': 'NJ',
  '10': 'NY', '11': 'NY', '12': 'NY', '13': 'NY', '14': 'NY',
  '15': 'PA', '16': 'PA', '17': 'PA', '18': 'PA', '19': 'PA',
  '20': 'DC', '21': 'MD', '22': 'VA', '23': 'VA', '24': 'VA',
  '25': 'MA', '26': 'MI', '27': 'NC', '28': 'NC', '29': 'SC',
  '30': 'GA', '31': 'GA', '32': 'FL', '33': 'FL', '34': 'FL',
  '35': 'AL', '36': 'AL', '37': 'NC', '38': 'MS', '39': 'MS',
  '40': 'KY', '41': 'KY', '42': 'KY', '43': 'OH', '44': 'OH',
  '45': 'OH', '46': 'IN', '47': 'IN', '48': 'MI', '49': 'MI',
  '50': 'IA', '51': 'IA', '52': 'IA', '53': 'WI', '54': 'WI',
  '55': 'MN', '56': 'MN', '57': 'SD', '58': 'ND', '59': 'MT',
  '60': 'IL', '61': 'IL', '62': 'IL', '63': 'MO', '64': 'MO',
  '65': 'MO', '66': 'KS', '67': 'KS', '68': 'NE', '69': 'NE',
  '70': 'LA', '71': 'LA', '72': 'AR', '73': 'OK', '74': 'OK',
  '75': 'TX', '76': 'TX', '77': 'TX', '78': 'TX', '79': 'TX',
  '80': 'CO', '81': 'CO', '82': 'WY', '83': 'ID', '84': 'UT',
  '85': 'AZ', '86': 'AZ', '87': 'NM', '88': 'NM', '89': 'NV',
  '90': 'CA', '91': 'CA', '92': 'CA', '93': 'CA', '94': 'CA',
  '95': 'CA', '96': 'CA', '97': 'OR', '98': 'WA', '99': 'AK'
};

/**
 * 邮编查询类
 */
class ZipCodeLookup {
  /**
   * 根据邮编查询地理信息
   * @param {string} zipCode - 5位邮编
   * @returns {Promise<ZipLookupResult>} 地理信息
   */
  static async lookupZipCode(zipCode: string): Promise<ZipLookupResult> {
    if (!zipCode || zipCode.length < 5) {
      throw new Error('请输入有效的5位邮编');
    }

    // 清理邮编，只保留数字
    const cleanZip = zipCode.replace(/\D/g, '').slice(0, 5);
    
    if (cleanZip.length !== 5) {
      throw new Error('邮编必须是5位数字');
    }

    try {
      // 优先使用精确匹配
      if (ZIP_TO_STATE[cleanZip]) {
        const location = ZIP_TO_STATE[cleanZip];
        if (!location) {
          throw new Error('Location not found');
        }
        const stateInfo = STATE_TAX_INFO[location.state];
        if (!stateInfo) {
          throw new Error('State info not found');
        }

        return {
          zipCode: cleanZip,
          city: location.city,
          state: location.state,
          stateName: stateInfo.name,
          county: location.county,
          taxInfo: {
            hasStateTax: stateInfo.hasTax,
            stateRate: stateInfo.rate,
            recommendation: stateInfo.hasTax ? '需要申报州税' : '无需申报州税'
          },
          source: 'exact_match'
        };
      }

      // 尝试前缀匹配
      const prefix2 = cleanZip.slice(0, 2);
      const prefix3 = cleanZip.slice(0, 3);
      
      let state = ZIP_PREFIX_TO_STATE[prefix3] || ZIP_PREFIX_TO_STATE[prefix2];
      
      if (state && STATE_TAX_INFO[state]) {
        const stateInfo = STATE_TAX_INFO[state];
        if (!stateInfo) {
          throw new Error('State info not found');
        }

        return {
          zipCode: cleanZip,
          city: null, // 前缀匹配无法确定具体城市
          state: state,
          stateName: stateInfo.name,
          county: null,
          taxInfo: {
            hasStateTax: stateInfo.hasTax,
            stateRate: stateInfo.rate,
            recommendation: stateInfo.hasTax ? '需要申报州税' : '无需申报州税'
          },
          source: 'prefix_match',
          note: '基于邮编前缀匹配，城市信息可能不准确'
        };
      }

      // 如果都没匹配到，尝试API查询（实际项目中可以接入真实的邮编API）
      return await this.queryExternalAPI(cleanZip);
      
    } catch (error) {
      console.error('Zip code lookup failed:', error);
      throw new Error('邮编查询失败，请检查邮编是否正确');
    }
  }

  /**
   * 模拟外部API查询（实际项目中替换为真实API）
   * @param {string} zipCode
   * @returns {Promise<ZipLookupResult>}
   */
  static async queryExternalAPI(zipCode: string): Promise<ZipLookupResult> {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 模拟API返回
    return {
      zipCode: zipCode,
      city: 'Unknown City',
      state: 'XX',
      stateName: 'Unknown State',
      county: 'Unknown County',
      taxInfo: {
        hasStateTax: null,
        stateRate: 'Unknown',
        recommendation: '请手动选择州信息'
      },
      source: 'api_fallback',
      note: '无法识别此邮编，请手动确认州信息'
    };
  }

  /**
   * 获取所有无州税的州
   * @returns {Array<{code: string, name: string, benefit: string}>} 无州税州列表
   */
  static getNoStateTaxStates(): Array<{code: string, name: string, benefit: string}> {
    return Object.entries(STATE_TAX_INFO)
      .filter(([_code, info]) => !info.hasTax)
      .map(([code, info]) => ({
        code,
        name: info.name,
        benefit: '无州所得税'
      }));
  }

  /**
   * 获取高税率州列表
   * @returns {Array<{code: string, name: string, rate: string, warning: string}>} 高税率州列表
   */
  static getHighTaxStates(): Array<{code: string, name: string, rate: string, warning: string}> {
    const highTaxStates = ['CA', 'NY', 'NJ', 'HI', 'OR', 'MN', 'DC'];
    return Object.entries(STATE_TAX_INFO)
      .filter(([code, _info]) => highTaxStates.includes(code))
      .map(([code, info]) => ({
        code,
        name: info.name,
        rate: info.rate,
        warning: '高税率州，建议做税务规划'
      }));
  }

  /**
   * 获取税务建议
   * @param {string} state 州代码
   * @returns {TaxAdvice} 税务建议
   */
  static getTaxAdvice(state: string): TaxAdvice {
    const stateInfo = STATE_TAX_INFO[state];
    if (!stateInfo) {
      return { advice: '未知州，请咨询税务专家' };
    }

    const noTaxStates = ['AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY'];
    const highTaxStates = ['CA', 'NY', 'NJ', 'HI', 'OR', 'MN', 'DC'];
    const moderateTaxStates = ['CO', 'UT', 'NC', 'IL'];

    let advice = [];

    if (noTaxStates.includes(state)) {
      advice.push('🎉 恭喜！你居住在无州所得税的州');
      advice.push('💰 相比其他州，每年可节省数千美元州税');
      advice.push('📋 只需要申报联邦税，无需州税申报');
    } else if (highTaxStates.includes(state)) {
      advice.push('⚠️ 你居住在高税率州');
      advice.push('📊 建议做好税务规划，考虑各种扣除');
      advice.push('🏠 房贷利息、慈善捐款等可能特别有价值');
      advice.push('💼 如果是高收入，考虑咨询CPA');
    } else if (moderateTaxStates.includes(state)) {
      advice.push('📊 你居住的州税率适中');
      advice.push('🔍 可以比较标准扣除和分项扣除');
      advice.push('💡 适当的税务规划仍有节税空间');
    } else {
      advice.push('📋 请确认具体的州税要求');
      advice.push('💼 建议咨询当地税务专家');
    }

    return {
      state: stateInfo.name,
      rate: stateInfo.rate,
      hasStateTax: stateInfo.hasTax,
      advice
    };
  }

  /**
   * 验证邮编格式
   * @param {string} zipCode
   * @returns {boolean}
   */
  static isValidZipCode(zipCode: string): boolean {
    if (!zipCode) return false;
    const cleaned = zipCode.replace(/\D/g, '');
    return cleaned.length === 5 || cleaned.length === 9; // 支持ZIP和ZIP+4
  }

  /**
   * 格式化邮编
   * @param {string} zipCode
   * @returns {string}
   */
  static formatZipCode(zipCode: string): string {
    if (!zipCode) return '';
    const cleaned = zipCode.replace(/\D/g, '');
    
    if (cleaned.length <= 5) {
      return cleaned;
    } else if (cleaned.length <= 9) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    
    return cleaned.slice(0, 5);
  }
}

export default ZipCodeLookup;