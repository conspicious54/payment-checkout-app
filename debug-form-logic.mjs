// Debug the form step logic
const formSettings = {
  emailEnabled: true,
  phoneEnabled: false,  // DISABLED
  phoneVerificationEnabled: false,  // DISABLED
  ssnEnabled: true,
  bankAccountEnabled: true
};

console.log('Testing form step logic with phone DISABLED:\n');

// Test step 1
let step = 1;
let fieldStep = 0;
if (formSettings.emailEnabled) {
  fieldStep++;
  if (step === fieldStep) console.log(`Step ${step} should show: email`);
}
if (formSettings.phoneEnabled) {
  fieldStep++;
  if (step === fieldStep) console.log(`Step ${step} should show: phone`);
}
fieldStep++;
if (step === fieldStep) console.log(`Step ${step} should show: fullName`);
if (formSettings.ssnEnabled) {
  fieldStep++;
  if (step === fieldStep) console.log(`Step ${step} should show: ssn`);
}

// Test step 2
step = 2;
fieldStep = 0;
if (formSettings.emailEnabled) {
  fieldStep++;
  if (step === fieldStep) console.log(`Step ${step} should show: email`);
}
if (formSettings.phoneEnabled) {
  fieldStep++;
  if (step === fieldStep) console.log(`Step ${step} should show: phone`);
} else {
  console.log(`Step ${step}: Phone disabled, skipping phone step`);
}
fieldStep++;
if (step === fieldStep) console.log(`Step ${step} should show: fullName`);
if (formSettings.ssnEnabled) {
  fieldStep++;
  if (step === fieldStep) console.log(`Step ${step} should show: ssn`);
}
