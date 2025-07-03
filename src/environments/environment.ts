
export const environment = {
  production: false,

  vertice_url : {
    baseUrl: 'https://services-ui-vertice-qa.polizaqui.com',
    sypago:{
      auth: 'sypago/auth',
      otp: 'otp/sypago',
      bank: 'bankOptions',
      codeOtp:'verify/Code',
      notification: 'getNotifications',
      tasaBank: 'tasa'
    },
    emission:{
      authorize: 'authorize',
      token : 'auth',
      verify:'verify'
    }
  },
 
  account: '00014166604867298461',
  number_accout: '0001'
};

