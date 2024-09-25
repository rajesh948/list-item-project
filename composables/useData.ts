export const useData = () => {
  const data = [
    {
      id: 1,
      name: "બાઇટિંગ",
      items: [
        { id: 1, name: "લોલીપોપ", image: null },
        { id: 2, name: "ચીઝબોલ", image: null },
        { id: 3, name: "સ્પ્રિંગ રોલ", image: null },
        { id: 4, name: "ફ્રૂટ ડિશ", image: null },
        { id: 5, name: "ડ્રાયફ્રૂટ ડબ્બી", image: null },
        { id: 6, name: "નમકીન", image: null }
      ]
    },
    {
      id: 2,
      name: "સૂપ",
      items: [
        { id: 1, name: "મંચાઉ સૂપ", image: null },
        { id: 2, name: "ટામેટા સૂપ", image: null },
        { id: 3, name: "હોટ & સાવર સૂપ", image: null },
        { id: 4, name: "વેજ મન્ચુરિયન સૂપ", image: null }
      ]
    },
    {
      id: 3,
      name: "સ્ટાર્ટર",
      items: [
        { id: 1, name: "ડ્રેગન પોટેટો", image: null },
        { id: 2, name: "મન્ચુરિયન", image: null },
        { id: 3, name: "બેબીકોન ચિલી", image: null },
        { id: 4, name: "ફિંગર ચિપ્સ", image: null },
        { id: 5, name: "મશરૂમ ચિલી", image: null },
        { id: 6, name: "પનીર ચિલી ડ્રાય", image: null },
        { id: 7, name: "પનીર કુર્કુરે", image: null },
        { id: 8, name: "પનીર મન્ચુરિયન ડ્રાય", image: null },
        { id: 9, name: "પોટેટો ચિલી ડ્રાય", image: null },
        { id: 10, name: "સ્પ્રિંગ રોલ", image: null }
      ]
    },
    {
      id: 4,
      name: 'મીઠાઈ',
      items: [
        { id: 1, name: "દુધીની હલવો", image: null },
        { id: 2, name: "લાપસી", image: null },
        { id: 3, name: "ચુરમણા લાડવા", image: null },
        { id: 4, name: "બેસનના લાડવા", image: null },
        { id: 5, name: "મોહનથલ", image: null },
        { id: 6, name: "રબડી", image: null },
        { id: 7, name: "લચકો", image: null },
        { id: 9, name: "દુધપાક", image: null },
        { id: 10, name: "બર્ફી", image: null },
        { id: 11, name: "બસુંદી", image: null },

      ]
    },
    {
      id: 5,
      name: "કઠોળ",
      items: [
        { id: 1, name: "પાંચ કઠોળ", image: null },
        { id: 2, name: "ચણા", image: null },
        { id: 3, name: "મગ", image: null },
        { id: 4, name: "ચોળી", image: null },
        { id: 5, name: "સાબરસ ચણા", image: null },
        { id: 6, name: "દાળ ચણા", image: null },
        { id: 7, name: "અડદ", image: null },
        { id: 8, name: "અડદ ની સરિદળ દાળ", image: null },
        { id: 9, name: "વાલનું શાક", image: null },
        { id: 10, name: "મઠ", image: null }
      ]
    }
    ,
    {
      id: 6,
      name: "કાઠિયાવાડી",
      items: [
        { id: 1, name: "કઢી ખીચડી", image: null },
        { id: 2, name: "વઘારેલો રોટલો", image: null },
        { id: 3, name: "મસાલા રોટલો", image: null },
        { id: 4, name: "લસાણીયા બટાકા", image: null },
        { id: 5, name: "કોબીટ્ચ મસાલા", image: null },
        { id: 6, name: "ડુંગળી મસાલા", image: null },
        { id: 7, name: "મિક્સ ભાજી", image: null },
        { id: 8, name: "બેગણ ભરેલા", image: null },
        { id: 9, name: "બેગણ ભરતા", image: null },
        { id: 10, name: "બેગણ મસાલા", image: null },
        { id: 11, name: "ગીરનારી ખીચડી", image: null },
        { id: 12, name: "ભીંડા મસાલા", image: null },
        { id: 13, name: "સેવ ડુંગળી", image: null },
        { id: 14, name: "આલુ બેગણ રસાવાલા", image: null },
        { id: 15, name: "દહી ભીંડા", image: null },
        { id: 16, name: "કઢી પકોડા", image: null },
        { id: 17, name: "આલુ પાલક", image: null },
        { id: 18, name: "મગ મસાલા", image: null },
        { id: 19, name: "સેવ મસાલા", image: null },
        { id: 20, name: "સેવ ટમેટો", image: null },
        { id: 21, name: "બટાકા રસવાલા", image: null },
        { id: 22, name: "ઢોકરી", image: null },
        { id: 23, name: "પ્લેન પાલક", image: null },
        { id: 24, name: "સૂકીભાજી", image: null },
        { id: 25, name: "આલુ મટર", image: null },
        { id: 26, name: "ટમેટો ડુંગળી", image: null },
        { id: 27, name: "મસાલા ખીચડી", image: null },
        { id: 28, name: "દહીં તીખારી", image: null },
        { id: 29, name: "મગ ફ્રાય", image: null },
        { id: 30, name: "ભીંડા ફ્રાય", image: null },
        { id: 31, name: "પ્લેન ખીચડી", image: null },
        { id: 32, name: "ઉંધિયુ", image: null },
        { id: 33, name: "રિંગણ બટેકા ભરેલું", image: null },
        { id: 34, name: "ઢોકળી", image: null },
        { id: 35, name: "ગવાર બટેકા", image: null },
        { id: 36, name: "ભીંડા નું શાક", image: null },
        { id: 37, name: "ટામેટાનું શાક", image: null },
        { id: 38, name: "ડુંગરી બટેકા", image: null },
        { id: 39, name: "કોબી બટેકા", image: null },
        { id: 40, name: "ફ્લાવર બટેકા", image: null },
        { id: 41, name: "ચોરી બેટકા", image: null },
        { id: 42, name: "મીઠી ભાજી", image: null },
        { id: 43, name: "પાવભાજી", image: null },

      ]
    },
    {
      id: 7,
      name: "વેજીટેબલ વેરિયેટી",
      items: [
        { id: 1, name: "વેજીટેબલ દરબારી", image: null },
        { id: 2, name: "વેજીટેબલ જયપુરી", image: null },
        { id: 3, name: "વેજીટેબલ સિંગાપુરી", image: null },
        { id: 4, name: "વેજીટેબલ તૂફાની", image: null },
        { id: 5, name: "વેજીટેબલ કોળાપુરી", image: null },
        { id: 6, name: "વેજીટેબલ કડાઈ", image: null },
        { id: 7, name: "વેજીટેબલ તવા મસાલા", image: null },
        { id: 8, name: "વેજીટેબલ હંડી", image: null },
        { id: 9, name: "વેજીટેબલ હૈડેરાબાદી", image: null },
        { id: 10, name: "વેજીટેબલ મખણવાલા", image: null },
        { id: 11, name: "વેજીટેબલ રાજરાણી", image: null },
        { id: 12, name: "વેજીટેબલ કિમા મસાલા", image: null },
        { id: 13, name: "વેજીટેબલ હરિયાળી", image: null },
        { id: 14, name: "વેજીટેબલ નવરત્ન કોરમા", image: null },
        { id: 15, name: "વેજીટેબલ જાફરાની", image: null },
        { id: 16, name: "વેજીટેબલ મશરૂમ મસાલા", image: null },
        { id: 17, name: "વેજીટેબલ કોરમા", image: null },
        { id: 18, name: "વેજીટેબલ હંગામા", image: null },
        { id: 19, name: "વેજીટેબલ અંગારા", image: null },
        { id: 20, name: "વેજીટેબલ તિરંગા", image: null },
        { id: 21, name: "ટમેટો કોન ભર્તું", image: null },
        { id: 22, name: "પાલક કોન કૅપ્સિકમ", image: null },
        { id: 23, name: "મટર કૅપ્સિકમ", image: null },
        { id: 24, name: "વેજીટેબલ દિવાની", image: null },
        { id: 25, name: "શાહી વેજ.", image: null },
        { id: 26, name: "કૅપ્સિકમ ટમેટો", image: null },
        { id: 27, name: "કોન ભર્તું", image: null },
        { id: 28, name: "આલુ કૅપ્સિકમ", image: null },
        { id: 29, name: "મટર પાલક", image: null },
        { id: 30, name: "મિક્સ વેજિટેબલ", image: null }
      ]
    },
    {
      id: 8,
      name: "પંજાબી વેરિયેટી",
      items: [
        { id: 1, name: "પનીર બટર મસાલા", image: null },
        { id: 2, name: "પનીર ટિક્કા મસાલા", image: null },
        { id: 3, name: "પનીર ભુરજી", image: null },
        { id: 4, name: "પનીર તૂફાની", image: null },
        { id: 5, name: "પનીર અંગારા", image: null },
        { id: 6, name: "પનીર કડાઈ", image: null },
        { id: 7, name: "પનીર હંડી", image: null },
        { id: 8, name: "પનીર દો પ્યાઝા", image: null },
        { id: 9, name: "પનીર ટવા મસાલા", image: null },
        { id: 10, name: "પનીર હરિયાળી", image: null },
        { id: 11, name: "પનીર ચટપટા", image: null },
        { id: 12, name: "પનીર જયપુરી", image: null },
        { id: 13, name: "પનીર મખાણી", image: null },
        { id: 14, name: "પનીર પાસાંડા", image: null },
        { id: 15, name: "પનીર લાજવાબ", image: null },
        { id: 16, name: "પનીર પટિયાલા", image: null },
        { id: 17, name: "પનીર ખડા મસાલા", image: null },
        { id: 18, name: "પનીર કોર્મા", image: null },
        { id: 19, name: "પનીર લસણિયા", image: null },
        { id: 20, name: "પનીર કોલાપુરી", image: null },
        { id: 21, name: "પનીર મશરૂમ મસાલા", image: null },
        { id: 22, name: "પનીર દરબારી", image: null },
        { id: 23, name: "પનીર મુમ્તાજ", image: null },
        { id: 24, name: "પનીર લાજવાબદાર", image: null },
        { id: 25, name: "પનીર કાજુ ચીઝ મસાલા", image: null },
        { id: 26, name: "શાહી પનીર", image: null },
        { id: 27, name: "પાલક પનીર", image: null },
        { id: 28, name: "મટર પનીર", image: null },
        { id: 29, name: "ચીઝ પનીર", image: null },
        { id: 30, name: "ચીઝ રાજવાડી", image: null },
        { id: 31, name: "ચીઝ અંગૂરી", image: null },
        { id: 32, name: "ચીઝ પનીર મસાલા", image: null },
        { id: 33, name: "ચીઝ બટર મસાલા", image: null },
        { id: 34, name: "પનીર સિલસીલા", image: null },
        { id: 35, name: "પનીર બલ્ટી", image: null },
        { id: 36, name: "પનીર તિરંગા", image: null },
        { id: 37, name: "જીરા આલુ", image: null },
        { id: 38, name: "દામ આલુ", image: null },
        { id: 39, name: "ટમેટો કોન ભર્તા", image: null },
        { id: 40, name: "બેબી કોન બટર મસાલા", image: null },
        { id: 41, name: "ચણા મસાલા", image: null },
        { id: 42, name: "કાજુ કરી મસાલા", image: null },
        { id: 43, name: "કાજુ બટર મસાલા", image: null },
        { id: 44, name: "કાજુ મસાલા", image: null },
        { id: 45, name: "કાજુ પનીર", image: null },
        { id: 46, name: "કાજુ કાશ્મીરી (મીઠુ)", image: null },
        { id: 47, name: "કોયા કાજુ (મીઠુ)", image: null }
      ]
    },
    {
      id: 8,
      name: "ટંડૂરી",
      items: [
        { id: 1, name: "લસણ નાન", image: null },
        { id: 2, name: "ચીઝ બટર નાન", image: null },
        { id: 3, name: "સ્ટફ્ડ નાન", image: null },
        { id: 4, name: "ચીઝ નાન", image: null },
        { id: 5, name: "બટર નાન", image: null },
        { id: 6, name: "સાદો કુલ્ચા", image: null },
        { id: 7, name: "બટર કુલ્ચા", image: null },
        { id: 8, name: "મિસ્સી રોટી", image: null },
        { id: 9, name: "પેન રોટી", image: null },
        { id: 10, name: "સ્ટફ્ડ નાન", image: null },
        { id: 11, name: "બટર રોટી", image: null },
        { id: 12, name: "સાદો રોટી", image: null },
        { id: 13, name: "કાશ્મીરી નાન", image: null },
        { id: 14, name: "આલુ પરોઠા", image: null },
        { id: 15, name: "ખસ્તા રોટી", image: null },
        { id: 16, name: "મિક્સી રોટી", image: null },
        { id: 17, name: "જીરા રોટી", image: null },
        { id: 18, name: "ફુદીના રોટી", image: null },
        { id: 19, name: "લચ્છા પરાઠા", image: null }
      ]
    },
    {
      id: 9,
      name: "રોટલી",
      items: [
        { id: 1, name: "સ્વામી રોટલી", image: null },
        { id: 2, name: "ફૂલકા રોટલી", image: null },
        { id: 3, name: "પુડલા", image: null },
        { id: 4, name: "પરોઠા", image: null },
        { id: 5, name: "થેપલા", image: null },
        { id: 6, name: "પાવ (દાબેલી)", image: null },
        { id: 7, name: "રોટલા ચૂરમા", image: null },
        { id: 8, name: "બટર રોટલો (બાજરી)", image: null },
        { id: 9, name: "સાદો રોટલો (બાજરી)", image: null },
        { id: 10, name: "બટર તવા પરોઠા", image: null },
        { id: 11, name: "ફ્રાય પરોઠા", image: null },
      ]
    },
    {
      id: 10,
      name: "ચાઇનીઝ",
      items: [
        { id: 1, name: "ચાઇનીઝ ભેળ", image: null },
        { id: 2, name: "અમેરિકન ચોપસી", image: null },
        { id: 3, name: "મંચુરિયન નૂડલ્સ", image: null },
        { id: 4, name: "મંચુરિયન ફ્રાય નૂડલ્સ", image: null },
        { id: 5, name: "સેજવાન નૂડલ્સ", image: null },
        { id: 6, name: "સેજવાન રાઈસ", image: null },
        { id: 7, name: "વેજ ફ્રાય રાઈસ", image: null },
        { id: 8, name: "વેજ હાકા નૂડલ્સ", image: null },
        { id: 9, name: "વેજ. મનચુરિયન ગ્રેવી", image: null },
        { id: 10, name: "બેબી કોર્ન ચિલી ડ્રાય", image: null },
        { id: 11, name: "પનીર ચિલી ડ્રાય", image: null },
        { id: 12, name: "વેજીટેબલ મંચુરિયન ડ્રાય", image: null },
        { id: 13, name: "પનીર ચિલી ગ્રેવી", image: null },
        { id: 14, name: "વેજીટેબલ મંચુરિયન ગ્રેવી", image: null },
        { id: 15, name: "પનીર 65 ડ્રાય", image: null },
        { id: 16, name: "પનીર મંચુરિયન ડ્રાય", image: null },
        { id: 17, name: "માસરૂમ ચિલી ડ્રાય", image: null },
        { id: 18, name: "સ્પ્રિંગ રોલ", image: null },
        { id: 19, name: "પોટેટો ચિલી ડ્રાય", image: null },
        { id: 20, name: "ડ્રેગન પોટેટો", image: null },
        { id: 21, name: "વેજીટેબલ ક્રિસ્પી ડ્રાય", image: null },

      ]
    },
    {
      id: 11,
      name: "સાઉથ ઇન્ડિયન",
      items: [
        { id: 1, name: "ડોસા", image: null },
        { id: 2, name: "ફેન્સી ડોસા", image: null },
        { id: 3, name: "વાઈબ્રન્ટ ગુજરાત", image: null },
        { id: 4, name: "મસાલા ડોસા", image: null },
        { id: 5, name: "મસાલા ડોસા", image: null },
        { id: 6, name: "મેસુર મસાલા ડોસા", image: null },
        { id: 7, name: "મેસુર સાદા ડોસા", image: null },
        { id: 8, name: "ચીઝ મસાલા ડોસા", image: null },
        { id: 9, name: "સ્વીટ કોર્ન ડોસા", image: null },
        { id: 10, name: "મિની રોલ ડોસા", image: null },
        { id: 11, name: "મિની રોલ મસાલા ડોસા", image: null },
        { id: 12, name: "ગોટલા ડોસા", image: null },
        { id: 13, name: "મિની ટિર્વેલ મસાલા ડોસા", image: null },
        { id: 14, name: "મિની ટિર્વેલ સાદા ડોસા", image: null },
        { id: 15, name: "જમ્બો મસાલા ડોસા", image: null },
        { id: 16, name: "જમ્બો સાદા ડોસા", image: null },
        { id: 17, name: "પિઝા મસાલા ડોસા", image: null },
        { id: 18, name: "ચીઝ રોલ મસાલા ડોસા", image: null },
        { id: 19, name: "ચીઝ રોલ સાદા ડોસા", image: null },
        { id: 20, name: "ચીઝ મેસુરી મસાલા ડોસા", image: null },
        { id: 21, name: "ચીઝ મેસુરી સાદા ડોસા", image: null },
        { id: 22, name: "કેસરી મસાલા ડોસા", image: null },
        { id: 23, name: "ઇડલી-સાંભર", image: null },
        { id: 24, name: "મેડુ વડા", image: null },
        { id: 25, name: "દાળ વડા", image: null },
        { id: 26, name: "ટમાટો ઉત્તપમ", image: null },
        { id: 27, name: "ઓનિયન ઉત્તપમ", image: null },
        { id: 28, name: "મસાલા ઉત્તપમ", image: null },
        { id: 29, name: "મિક્સ ઉત્તપમ", image: null },
        { id: 30, name: "સ્વીટ કાશ્મીરી ઉત્તપમ", image: null }
      ]
    },
    {
      id: 12,
      name: "ફરસાણ",
      items: [
        { id: 1, name: "મિક્સ ભજિયા", image: null },
        { id: 2, name: "સેવ રોલ", image: null },
        { id: 3, name: "કટલેસ", image: null },
        { id: 4, name: "ઢોકળા", image: null },
        { id: 5, name: "સમોસા", image: null },
        { id: 6, name: "ઘૂઘરા", image: null },
        { id: 7, name: "ભુંગડા બટેકા", image: null },
        { id: 8, name: "કચોરી", image: null },
        { id: 9, name: "ફ્રાઇમસ", image: null },
        { id: 10, name: "શિંગ પાપડ", image: null },
        { id: 11, name: "બ્રેડ બટેકા", image: null },
        { id: 12, name: "દાબેલી", image: null },
        { id: 13, name: "વડા પાઉ", image: null }
      ]
    },
    {
      id: 13,
      name: "પિઝ્ઝા",
      items: [
        { id: 1, name: "ઇટાલિયન પિઝ્ઝા", image: null },
        { id: 2, name: "ખારી પિઝ્ઝા", image: null },
        { id: 3, name: "વોલ્વો પિઝ્ઝા", image: null },
        { id: 4, name: "અમેરિકન પિઝ્ઝા", image: null },
        { id: 5, name: "કેપ્સિકમ પિઝ્ઝા", image: null },
        { id: 6, name: "માર્ગેરિટા પિઝ્ઝા", image: null },
        { id: 7, name: "ગાર્લિક બ્રેડ", image: null },
        { id: 8, name: "ચીઝ પિઝ્ઝા", image: null },
        { id: 9, name: "વેજ પિઝ્ઝા", image: null },
        { id: 10, name: "બ્રેડ પિઝ્ઝા", image: null }
      ]
    },
    {
      id: 14,
      name: "ચાટ",
      items: [
        { id: 1, name: "અમેરિકન ચાટ", image: null },
        { id: 2, name: "બોમ્બે ચાટ", image: null },
        { id: 3, name: "હૈદરાબાદી ચાટ", image: null },
        { id: 4, name: "નવલખી ચાટ", image: null },
        { id: 5, name: "ટિકી ચાટ", image: null },
        { id: 6, name: "દહીં વડા", image: null },
        { id: 7, name: "પાલક પત્તા", image: null },
        { id: 8, name: "પાન ચાટ", image: null },
        { id: 9, name: "પાણીપુરી", image: null },
        { id: 10, name: "બાસ્કેટ ચાટ", image: null },
        { id: 11, name: "ચાટપુરી", image: null },
        { id: 12, name: "રગડા પેટીસ", image: null },
        { id: 13, name: "રગડો", image: null },
        { id: 14, name: "સમોસા ચાટ", image: null },
        { id: 15, name: "કચોરી ચાટ", image: null }
      ]
    },

    {
      id: 15,
      name: "રાયતા",
      items: [
        { id: 1, name: "પાઇનએપલ રાયતા", image: null },
        { id: 2, name: "દહી રાયતા", image: null },
        { id: 3, name: "વેજ. રાયતા", image: null },
        { id: 4, name: "ડુંગળી રાયતા", image: null },
        { id: 5, name: "બુંદી રાયતા", image: null },
        { id: 6, name: "મિક્સ ફ્રુટ રાયતા", image: null }
      ]
    },
    {
      id: 16,
      name: "દાળ",
      items: [
        { id: 1, name: "ગુજરાતી દાળ", image: null },
        { id: 2, name: "દાળફ્રાય", image: null },
        { id: 3, name: "દાળ મખાની", image: null },
        { id: 4, name: "તડકા દાળ", image: null }
      ]
    },
    {
      id: 17,
      name: "ભાત",
      items: [
        { id: 1, name: "ગુજરાતી ભાત", image: null },
        { id: 2, name: "જીરા રાઇસ", image: null },
        { id: 3, name: "હૈદરાબાદી બિરયાની", image: null },
        { id: 4, name: "કાજૂ પુલાવ", image: null },
        { id: 5, name: "કાશ્મીરી પુલાવ", image: null },
        { id: 6, name: "વેજ બિરયાની", image: null },
        { id: 7, name: "સાદો પુલાવ", image: null }
      ]
    },
    {
      id: 18,
      name: "સલાડ",
      items: [
        { id: 1, name: "લીલું સલાડ", image: null },
        { id: 2, name: "ડુંગરી", image: null },
        { id: 3, name: "ટામેટા", image: null },
        { id: 4, name: "રાયતા મરચા", image: null },
        { id: 5, name: "મરચા", image: null },
        { id: 6, name: "સંભારો ગાજર", image: null }
      ]
    },
    {
      id: 19,
      name: "ચટણી",
      items: [
        { id: 1, name: "લાલ ચટણી", image: null },
        { id: 2, name: "લીલી ચટણી", image: null },
        { id: 3, name: "લસણ ચટણી", image: null },
        { id: 4, name: "કેરી ચટણી", image: null },
        { id: 5, name: "ફુદીના ચટણી", image: null }
      ]
    },
    {
      id: 20,
      name: "પાપડ",
      items: [
        { id: 1, name: "ચોખાના પાપડ", image: null },
        { id: 2, name: "આલાદ પાપડ", image: null },
        { id: 3, name: "ફ્રાઇમસ પાપડ", image: null },
        { id: 4, name: "ભુંગડા", image: null }
      ]
    },
    {
      id: 21,
      name: "લસ્સી",
      items: [
        { id: 1, name: "કોલ્ડ કોફી વિથ આઇસ ક્રીમ", image: null },
        { id: 2, name: "સ્વીટ લસ્સી", image: null },
        { id: 3, name: "કોલ્ડ કોફી", image: null }
      ]
    },
    {
      id: 22,
      name: "જ્યૂસ",
      items: [
        { id: 1, name: "પાઇનએપલ", image: null },
        { id: 2, name: "જામફડ", image: null },
        { id: 3, name: "સફરજન", image: null },
        { id: 4, name: "તરુભચ", image: null },
        { id: 5, name: "લીલી દ્રાક્ષ", image: null },
        { id: 6, name: "કાળી દ્રાક્ષ", image: null },
        { id: 7, name: "શંકર તેટે", image: null },
        { id: 8, name: "ચીકુ", image: null },
        { id: 9, name: "સંત્રા", image: null }
      ]
    },

    {
      id: 13,
      name: "ઠંડા પીણા",
      items: [
        { id: 1, name: "લીંબૂ શરબત", image: null },
        { id: 2, name: "ઠંડુ", image: null },
        { id: 3, name: "ફુદીના શરબત", image: null },
        { id: 4, name: "મેંગો શરબત", image: null },
        { id: 5, name: "કાચી કેરી શરબત", image: null },
        { id: 6, name: "પાઇનેપલ શરબત", image: null },
        { id: 7, name: "ઓરેંજ શરબત", image: null },
        { id: 8, name: "સોડા", image: null },
        { id: 9, name: "સિંગ શરબત", image: null }
      ]
    },
    {
      id: 24,
      name: 'પાણી',
      items: [
        { id: 1, name: "મિનરલ", image: null },
        { id: 2, name: "સાદુ", image: null },
        { id: 3, name: "મિની બોટલ", image: null },
        { id: 4, name: "નેમ બોટલ", image: null },


      ]
    },
    {
      id: 25,
      name: "થાળી/પ્લેટ",
      items: [
        { id: 1, name: "વીઆઈપી", image: null },
        { id: 2, name: "વિવીઆઈપી", image: null },
        { id: 3, name: "નોર્મલ", image: null },
        { id: 4, name: "સાદી", image: null },
        { id: 5, name: "ગોલ્ડન", image: null },
        { id: 6, name: "ડિસ્પ્લેટ", image: null },
        { id: 7, name: "રોયલ", image: null },
      ]
    },
    {
      id: 26,
      name: "કપલ",
      items: [[

        { id: 2, name: "વિવીઆઈપી", image: null },
        { id: 2, name: "વીઆઈપી", image: null },
        { id: 3, name: "નોર્મલ", image: null },
        { id: 4, name: "લોકલ", image: null },
        { id: 5, name: "એમટિ", image: null }
      ]]
    },
  ];


  const decorationTable = [
    {
      id: 1,
      name: "Table 1",
      images: [
        { id: 1, image: "/images/item2.jpg" },
        { id: 2, image: "/images/item3.jpg" },
        { id: 3, image: "/images/item4.jpg" },
        { id: 4, image: "/images/item5.jpg" }
      ]
    },
    {
      id: 2,
      name: "Table 2",
      images: [
        { id: 1, image: "/images/item2.jpg" },
        { id: 2, image: "/images/item3.jpg" },
        { id: 3, image: "/images/item4.jpg" },
        { id: 4, image: "/images/item5.jpg" }
      ]
    },
    {
      id: 3,
      name: "Table 3",
      images: [
        { id: 1, image: "/images/item2.jpg" },
        { id: 2, image: "/images/item3.jpg" },
        { id: 3, image: "/images/item4.jpg" },
        { id: 4, image: "/images/item5.jpg" }
      ]
    },
  ]
  return {
    data, decorationTable
  };
};
