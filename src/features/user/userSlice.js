import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAddress } from '../../services/apiGeocoding';

function getPosition() {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

export const fetchAddress = createAsyncThunk(
  'user/fetchAddress',
  async function () {
    const positionObj = await getPosition();
    const position = {
      latitude: positionObj.coords.latitude,
      longitude: positionObj.coords.longitude,
    };

    const addressObj = await getAddress(position);
    const address = `${addressObj?.locality}, ${addressObj?.city} ${addressObj?.postcode}, ${addressObj?.countryName}`;

    return { position, address };
  }
);

const initialState = {
  // Customer info from Telegram + Supabase
  customerId: null,
  firstName: '',
  lastName: '',
  telegramUsername: '',
  avatarUrl: '',
  phone: '',
  languageCode: 'en',

  // Geolocation
  position: {},
  address: '',

  // Status
  status: 'idle', // 'idle' | 'loading' | 'error'
  error: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Update full customer profile
    updateCustomer(state, action) {
      const {
        id,
        first_name,
        last_name,
        telegram_username,
        avatar_url,
        phone,
        language_code,
      } = action.payload;

      state.customerId = id;
      state.firstName = first_name || '';
      state.lastName = last_name || '';
      state.telegramUsername = telegram_username || '';
      state.avatarUrl = avatar_url || '';
      state.phone = phone || '';
      state.languageCode = language_code || 'en';
    },

    // Optional: update only phone later
    updatePhone(state, action) {
      state.phone = action.payload;
    },

    // Clear user (logout)
    clearUser(state) {
      return initialState;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(fetchAddress.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAddress.fulfilled, (state, action) => {
        state.position = action.payload.position;
        state.address = action.payload.address;
        state.status = 'idle';
      })
      .addCase(fetchAddress.rejected, (state) => {
        state.status = 'error';
        state.error =
          'Could not get your location. Please enter address manually.';
      }),
});

export const { updateCustomer, updatePhone, clearUser } = userSlice.actions;

export default userSlice.reducer;
