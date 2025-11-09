// utils/validateTelegram.js

export function validateTelegramInitData(initData, botToken) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;

  console.log('Params before delete:', initData);
  params.delete('hash');

  // // Build data_check_string
  // const dataCheckString = Array.from(params.entries())
  //   .map(([k, v]) => `${k}=${v}`)
  //   .sort()
  //   .join('\n');
  // console.log('Data check string:', dataCheckString);
  // // ✅ Step 1: Create the secret key correctly
  // const secret = CryptoJS.HmacSHA256(
  //   'WebAppData',
  //   '7919874868:AAEQGn-SnjiZJyrE8S8XhyKqvvS18hp_-Yk'
  // );
  // console.log('Secret key for HMAC-SHA256:', secret.toString(CryptoJS.enc.Hex));
  // // ✅ Step 2: Calculate the verification hash
  // const calculatedHash = CryptoJS.HmacSHA256(dataCheckString, secret).toString(
  //   CryptoJS.enc.Hex
  // );
  // console.log('Calculated hash:', calculatedHash);
  // if (calculatedHash !== hash) {
  //   // data is from Telegram
  //   console.warn('Invalid Telegram init data hash');
  //   return null;
  // }

  // if (calculatedHash !== hash) {
  //   console.warn('Invalid Telegram init data hash');
  //   return null;
  // }

  // Parse and return user info
  try {
    const user = JSON.parse(params.get('user'));
    return {
      id: user.id,
      first_name: user.first_name,
      username: user.username,
      photo_url: user.photo_url,
      last_name: user.last_name,
      language_code: user.language_code,
      phone: user.phone,
    };
  } catch (err) {
    console.error('Invalid user JSON in Telegram initData', err);
    return null;
  }
}
