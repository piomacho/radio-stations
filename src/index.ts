import app from '@server';

// Start the server
const port = Number(5000);
app.listen(port, () => {
    console.info('Express server started on port: ' + port);
});
