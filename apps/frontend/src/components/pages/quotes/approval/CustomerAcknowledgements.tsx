interface CustomerAcknowledgementsProps {
  acknowledgements: string[];
}

const CustomerAcknowledgements = ({
  acknowledgements,
}: CustomerAcknowledgementsProps) => {
  return (
    <div>
      <h4 className="font-semibold mb-2">Customer Acknowledgements</h4>
      <ul className="list-decimal pl-5 space-y-1 text-sm">
        {acknowledgements.map((txt, index) => (
          <li key={index}>{txt}</li>
        ))}
      </ul>
    </div>
  );
};

export default CustomerAcknowledgements;
