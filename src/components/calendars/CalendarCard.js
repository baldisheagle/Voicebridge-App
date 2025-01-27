import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Text, Button, Dialog, TextField, AlertDialog, VisuallyHidden, Card } from '@radix-ui/themes';
import { GoogleLogo, Trash, Pencil, Stethoscope } from '@phosphor-icons/react';
import { dbDeleteCalendar, dbUpdateCalendarName } from '../../utilities/database';
import toast from 'react-hot-toast';
import Moment from 'react-moment';

const CalendarCard = ({
    auth,
    calendar,
    onDelete,
}) => {

    const [calendarName, setCalendarName] = useState(null);
    const [calendarNameDialogOpen, setCalendarNameDialogOpen] = useState(false);

    useEffect(() => {
        if (auth && calendar) {
            setCalendarName(calendar.name);
        }
    }, [auth, calendar]);

    const updateCalendarName = async(calendarName) => {
        console.log('updateCalendarName', calendarName);
        dbUpdateCalendarName(calendar.id, calendarName, auth.workspace.id).then((success) => {
            if (success) {
                setCalendarName(calendarName);
                toast.success('Calendar name updated');
            } else {
                toast.error('Failed to update calendar name');
            }
        });
    }

    const deleteCalendar = async() => {
        console.log('deleteCalendar');
        dbDeleteCalendar(calendar.id, auth.workspace.id).then((success) => {
            if (success) {
                toast.success('Calendar deleted');
                onDelete();
            } else {
                toast.error('Failed to delete calendar');
            }
        });
    }

    if (!auth || !auth.workspace || !calendar) {
        return null;
    }

    return (
        <Card>
        {calendar.provider === 'google' && <GoogleLogo size={24} />}
        {calendar.provider === 'drchrono' && <Stethoscope size={24} />}
        {calendar.provider === 'epic' && <Stethoscope size={24} />}
        <Text size="3" as="div" weight="bold" style={{ marginTop: 20 }}>{calendarName}</Text>
        <Text size="1" as="div" color="gray" style={{ marginTop: 5 }}>Created: <Moment format="DD MMM YYYY">{calendar.createdAt}</Moment></Text>
        <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 40 }}>
          {/* Edit calendar */}
          <Button variant="ghost" size="3" color="gray" style={{ marginRight: 5 }} onClick={() => { setCalendarNameDialogOpen(true); }}><Pencil /></Button>
          <Dialog.Root open={calendarNameDialogOpen} onOpenChange={setCalendarNameDialogOpen}>
            <Dialog.Content maxWidth="450px">
              <Dialog.Title>Edit name</Dialog.Title>
              <VisuallyHidden>
                <Dialog.Description size="2">
                  Edit the name of the calendar
                </Dialog.Description>
              </VisuallyHidden>
              <TextField.Root variant="outline" value={calendarName} onChange={(e) => setCalendarName(e.target.value.length > 0 ? e.target.value : 'No name')} />
              <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
                <Button variant="solid" color="gray" onClick={() => console.log('cancel')}>Cancel</Button>
                <Button variant="solid" onClick={() => {
                  updateCalendarName(calendarName);
                  setCalendarNameDialogOpen(false);
                }}>Save</Button>
              </Row>
            </Dialog.Content>
          </Dialog.Root>
          {/* Delete calendar */}
          <AlertDialog.Root>
            <AlertDialog.Trigger>
              <Button variant="ghost" size="3" color="red"><Trash /></Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content maxWidth="450px">
              <AlertDialog.Title>Delete {calendar.name}</AlertDialog.Title>
              <AlertDialog.Description size="2">
                Are you sure you want to delete this calendar?
              </AlertDialog.Description>

              <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 10 }}>
                <AlertDialog.Cancel>
                  <Button variant="solid" color="gray">
                    Cancel
                  </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                  <Button variant="solid" color="red" onClick={() => deleteCalendar(calendar.id)}>
                    Delete
                  </Button>
                </AlertDialog.Action>
              </Row>
            </AlertDialog.Content>
          </AlertDialog.Root>
        </Row>
      </Card>
    )
}

export default CalendarCard;