# Registration System Setup - Summary

## ✅ COMPLETED
1. **Created RegistrationService** - Handles event registration creation and management
2. **Updated TrendingEvents component** - Now shows real registration counts instead of mock data
3. **Updated LiveEvents component** - Now uses real database events with registration counts
4. **Updated EventDetailsPage** - Integrated with RegistrationService for real registrations
5. **Updated EventService** - Added method to fetch events with registration counts
6. **Removed all mock/fake events** - Components now only show real database events

## 🚧 NEXT STEPS REQUIRED

### 1. Create the Registrations Table
**Action Required:** Run this SQL in your Supabase SQL Editor:

```sql
-- Copy and paste this into Supabase SQL Editor
CREATE TABLE public.event_registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  attendee_email VARCHAR(255) NOT NULL,
  attendee_name VARCHAR(255),
  attendee_phone VARCHAR(50),
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_reference VARCHAR(255),
  ticket_type VARCHAR(100),
  amount_paid DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'GHS',
  status VARCHAR(50) DEFAULT 'confirmed',
  check_in_time TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON public.event_registrations(attendee_email);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON public.event_registrations(status);
CREATE INDEX IF NOT EXISTS idx_event_registrations_payment_status ON public.event_registrations(payment_status);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view registrations for published events" ON public.event_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = event_registrations.event_id 
      AND events.is_published = true
    )
  );

CREATE POLICY "Anyone can insert registrations" ON public.event_registrations
  FOR INSERT WITH CHECK (true);
```

### 2. Create Test Registration Data (Optional)
After creating the table, run:
```bash
node create-test-registrations.cjs
```

### 3. Test the End-to-End Flow
1. Browse to http://localhost:5175
2. Navigate to an event detail page
3. Try registering for both free and paid events
4. Verify registration counts update in real-time

## 🎯 CURRENT STATUS

- **Database Events:** ✅ 3 published events available
- **Registration Table:** ❌ Needs to be created manually in Supabase
- **Payment Integration:** ✅ Live Paystack integration ready
- **Frontend Components:** ✅ All updated to use real data
- **Event Registration:** ✅ Ready to work once table is created

## 🔧 TESTING COMMANDS

Check if registrations table exists:
```bash
node check-registrations-table.cjs
```

Create test registrations:
```bash
node create-test-registrations.cjs
```

Check database status:
```bash
node debug-database.cjs
```

## 🎉 FINAL RESULT

Once the registrations table is created:
- Event cards will show real registration counts (currently 0 until people register)
- Registration flow will create actual database records
- Payment processing will work with live Paystack
- All mock/fake data has been removed
- Real-time registration updates will work
