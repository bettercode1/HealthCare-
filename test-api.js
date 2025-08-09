// Simple test script to verify API endpoints
const API_BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('Testing API endpoints...\n');

  // Test 1: Create a medication
  console.log('1. Testing medication creation...');
  try {
    const medicationData = {
      medicineName: 'Test Medication',
      dosage: '1 tablet',
      doseStrength: '10mg',
      doseForm: 'tablet',
      frequency: 'daily',
      times: ['08:00'],
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      instructions: 'Take with food',
      sideEffects: ['nausea', 'dizziness'],
      administrationMethod: 'oral',
      specialInstructions: 'Avoid alcohol',
      isRunning: true
    };

    const response = await fetch(`${API_BASE_URL}/medications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': 'test-user-123'
      },
      body: JSON.stringify(medicationData)
    });

    if (response.ok) {
      const medication = await response.json();
      console.log('✅ Medication created successfully:', medication.id);
      
      // Test 2: Get medications
      console.log('\n2. Testing medication retrieval...');
      const getResponse = await fetch(`${API_BASE_URL}/medications`, {
        headers: {
          'user-id': 'test-user-123'
        }
      });
      
      if (getResponse.ok) {
        const medications = await getResponse.json();
        console.log('✅ Medications retrieved successfully:', medications.length, 'medications');
        
        // Test 3: Create a dose record
        console.log('\n3. Testing dose record creation...');
        const doseData = {
          medicationId: medication.id,
          medicationName: medication.medicineName,
          dosage: medication.dosage,
          doseStrength: medication.doseStrength,
          doseForm: medication.doseForm,
          administrationMethod: medication.administrationMethod,
          scheduledTime: '2024-01-15T08:00:00',
          status: 'pending',
          instructions: medication.instructions
        };

        const doseResponse = await fetch(`${API_BASE_URL}/dose-records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'user-id': 'test-user-123'
          },
          body: JSON.stringify(doseData)
        });

        if (doseResponse.ok) {
          const doseRecord = await doseResponse.json();
          console.log('✅ Dose record created successfully:', doseRecord.id);
          
          // Test 4: Create a health report
          console.log('\n4. Testing health report creation...');
          const reportData = {
            title: 'Blood Test Report',
            reportType: 'bloodTest',
            labName: 'Test Lab',
            doctorName: 'Dr. Smith',
            reportNumber: 'LAB-2024-001',
            testDate: '2024-01-15',
            fileUrl: '',
            analysis: {
              parameters: {
                'Hemoglobin': {
                  value: 14.2,
                  unit: 'g/dL',
                  normalRange: '12-16',
                  status: 'normal'
                },
                'Glucose': {
                  value: 95,
                  unit: 'mg/dL',
                  normalRange: '70-100',
                  status: 'normal'
                }
              },
              summary: {
                normalCount: 2,
                abnormalCount: 0,
                criticalCount: 0,
                overallStatus: 'healthy',
                riskLevel: 'low',
                recommendations: ['Continue monitoring']
              }
            },
            source: 'web'
          };

          const reportResponse = await fetch(`${API_BASE_URL}/reports`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'user-id': 'test-user-123'
            },
            body: JSON.stringify(reportData)
          });

          if (reportResponse.ok) {
            const report = await reportResponse.json();
            console.log('✅ Health report created successfully:', report.id);
            
            // Test 5: Get dashboard stats
            console.log('\n5. Testing dashboard stats...');
            const statsResponse = await fetch(`${API_BASE_URL}/dashboard/stats`, {
              headers: {
                'user-id': 'test-user-123'
              }
            });

            if (statsResponse.ok) {
              const stats = await statsResponse.json();
              console.log('✅ Dashboard stats retrieved successfully:', stats);
            } else {
              console.log('❌ Failed to get dashboard stats:', statsResponse.status);
            }
          } else {
            console.log('❌ Failed to create health report:', reportResponse.status);
          }
        } else {
          console.log('❌ Failed to create dose record:', doseResponse.status);
        }
      } else {
        console.log('❌ Failed to get medications:', getResponse.status);
      }
    } else {
      console.log('❌ Failed to create medication:', response.status);
    }
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }

  console.log('\n✅ API test completed!');
}

// Run the test
testAPI();
